// radar: selvgående agent som ukentlig samler inspirasjon til øvelser/tester
// fra YouTube-søk og RSS-feeder fra kjente golf-utstyr/instruksjon-sider.
// Lagrer RÅ funn i RadarFunn (behandlet=false) — kopierer ALDRI tekst/video,
// kun tittel + lenke + kort sammendrag. Fabrikk-agenten (neste steg i
// øvelses-motoren) leser ubehandlede funn herfra og genererer egne
// øvelse-/test-utkast basert på dem + masterbrain-fasiten.
//
// RSS-kilder er verifisert manuelt (ekte, fungerende feeder) — golf.com og
// golfwrx.com. Legg kun til NYE kilder her etter å ha bekreftet at feeden
// faktisk finnes og svarer (mange golf-utstyrs-nettsteder blokkerer roboter).

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { isYoutubeEnabled, searchYoutube } from "./youtube-search";

export const AGENT_NAME = "radar";

const YT_QUERIES = [
  "golf training drill",
  "golf short game drill",
  "golf putting drill technique",
  "golf swing technology 2026",
  "golf equipment news trackman",
];
const YT_MAKS_PER_SOK = 4;

const RSS_FEEDS = [
  { kildeNavn: "Golf.com", url: "https://golf.com/feed/" },
  { kildeNavn: "GolfWRX", url: "https://golfwrx.com/feed/" },
];
const RSS_MAKS_PER_FEED = 8;
const HENT_TIMEOUT_MS = 10_000;

type RssItem = { tittel: string; url: string; publisertAt: Date | null; sammendrag: string | null };

const HTML_ENTITETER: Record<string, string> = {
  "&#8217;": "'",
  "&#8216;": "'",
  "&#8220;": "“",
  "&#8221;": "”",
  "&#8211;": "-",
  "&#8212;": "-",
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
  "&nbsp;": " ",
};

function dekodEntiteter(s: string): string {
  return s.replace(/&#?\w+;/g, (m) => HTML_ENTITETER[m] ?? m);
}

function stripHtml(s: string): string {
  return dekodEntiteter(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function tekst(felt: string | undefined): string | null {
  if (!felt) return null;
  const t = dekodEntiteter(felt.trim());
  return t.length > 0 ? t : null;
}

/** Enkel, tolerant RSS 2.0-parser — dekker <item> med title/link/pubDate/
 * description (CDATA eller rå tekst). Ingen ekstern XML-avhengighet trengs
 * for dette velkjente, forutsigbare formatet. */
function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blokker = xml.split("<item>").slice(1);
  for (const raw of blokker) {
    const blokk = raw.split("</item>")[0] ?? "";
    const tittelM = blokk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkM = blokk.match(/<link>([\s\S]*?)<\/link>/);
    const pubM = blokk.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descM = blokk.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);

    const tittel = tekst(tittelM?.[1]);
    const url = tekst(linkM?.[1]);
    if (!tittel || !url) continue;

    const pubRaw = pubM?.[1]?.trim();
    const dato = pubRaw ? new Date(pubRaw) : null;
    const publisertAt = dato && !Number.isNaN(dato.getTime()) ? dato : null;

    const sammendragRaw = descM?.[1] ? stripHtml(descM[1]) : null;
    const sammendrag = sammendragRaw ? sammendragRaw.slice(0, 300) : null;

    items.push({ tittel, url, publisertAt, sammendrag });
  }
  return items;
}

async function hentRssFunn(): Promise<Array<RssItem & { kildeNavn: string }>> {
  const alle: Array<RssItem & { kildeNavn: string }> = [];
  for (const feed of RSS_FEEDS) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), HENT_TIMEOUT_MS);
      const res = await fetch(feed.url, { signal: ctrl.signal, headers: { "User-Agent": "AK Golf HQ radar-agent" } });
      clearTimeout(timer);
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRssItems(xml).slice(0, RSS_MAKS_PER_FEED);
      for (const it of items) alle.push({ ...it, kildeNavn: feed.kildeNavn });
    } catch (err) {
      console.error(`radar-agent: RSS-henting feilet for ${feed.kildeNavn}`, err);
    }
  }
  return alle;
}

export async function runRadar(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const funnetVideo: Array<{ kildeNavn: string; tittel: string; url: string }> = [];
    if (isYoutubeEnabled()) {
      for (const sok of YT_QUERIES) {
        const treff = await searchYoutube(sok, YT_MAKS_PER_SOK);
        for (const v of treff) funnetVideo.push({ kildeNavn: v.channel, tittel: v.title, url: v.url });
      }
    }

    const funnetRss = await hentRssFunn();

    const kandidater: Array<{ kilde: string; kildeNavn: string; tittel: string; url: string; sammendrag: string | null; publisertAt: Date | null }> = [
      ...funnetVideo.map((v) => ({ kilde: "youtube", kildeNavn: v.kildeNavn, tittel: v.tittel, url: v.url, sammendrag: null, publisertAt: null })),
      ...funnetRss.map((a) => ({ kilde: "rss", kildeNavn: a.kildeNavn, tittel: a.tittel, url: a.url, sammendrag: a.sammendrag, publisertAt: a.publisertAt })),
    ];

    if (kandidater.length === 0) {
      return {
        output: {
          status: isYoutubeEnabled() ? "ingen-funn" : "youtube-av",
          melding: isYoutubeEnabled()
            ? "Verken YouTube eller RSS ga treff denne uka."
            : "YOUTUBE_API_KEY er ikke satt — kun RSS forsøkt.",
        },
      };
    }

    // Dedup mot allerede lagrede URL-er (unngå duplikater uke etter uke —
    // feedene/søkene overlapper naturlig med forrige kjøring).
    const eksisterende = await prisma.radarFunn.findMany({
      where: { url: { in: kandidater.map((k) => k.url) } },
      select: { url: true },
    });
    const kjenteUrler = new Set(eksisterende.map((e) => e.url));
    const nye = kandidater.filter((k) => !kjenteUrler.has(k.url));

    if (nye.length > 0) {
      await prisma.radarFunn.createMany({ data: nye });
    }

    return {
      output: {
        status: "ok",
        youtube: isYoutubeEnabled() ? "på" : "av",
        videoSokt: isYoutubeEnabled() ? YT_QUERIES.length : 0,
        videoFunnet: funnetVideo.length,
        rssFeedsSjekket: RSS_FEEDS.length,
        rssFunnet: funnetRss.length,
        nyeLagret: nye.length,
        duplikaterHoppetOver: kandidater.length - nye.length,
      },
    };
  });
}
