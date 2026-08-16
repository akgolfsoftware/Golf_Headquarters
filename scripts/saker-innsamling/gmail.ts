/**
 * Gmail-innsamler for Jarvis' "Saker"-kø (steg 2 av jarvis-masterplan.md,
 * DEL A steg 2). Henter nye e-poster og oppretter `Sak`-rader med status
 * VENTER, kanal EPOST — INGEN klassifisering og INGEN foreslattSvar her
 * (det er steg 3, triage-agenten). Ren innsamling.
 *
 * Sender/oppretter ALDRI noe i Gmail. Leser kun.
 *
 * Kjør: npm run saker:gmail
 * LaunchAgent-mal: com.akgolf.saker-gmail.plist (samme mappe).
 */
import "../_env";
import type { gmail_v1 } from "googleapis";
import { getGmailApi } from "@/lib/google-gmail";
import { prisma } from "@/lib/prisma";
import { hentAdminGoogleTilkobling } from "./google-tilkobling";
import { lesSakerInnsamlingEnv, SAKER_SLA_TIMER } from "./env";

const EN_TIME_MS = 60 * 60 * 1000;

/**
 * Enkel, lokal støy-heuristikk (INGEN sky-AI — det er steg 3 sin jobb å
 * klassifisere innhold). Filtrerer bort åpenbare nyhetsbrev/no-reply-
 * avsendere FØR en Sak opprettes, slik at køen ikke fylles med støy en
 * innsamler aldri burde vist frem. Falske positiver er billigere enn falske
 * negativer her: er avsenderen tvetydig, lages saken — bevisst konservativt.
 */
function erAapenbarStoy(fraHeader: string, headers: gmail_v1.Schema$MessagePartHeader[] | undefined): boolean {
  const fra = fraHeader.toLowerCase();
  const STOY_MONSTRE = [
    "no-reply@",
    "noreply@",
    "no.reply@",
    "notifications@",
    "notification@",
    "newsletter@",
    "nyhetsbrev@",
    "mailer-daemon@",
  ];
  if (STOY_MONSTRE.some((m) => fra.includes(m))) return true;
  // List-Unsubscribe-headeren er et sterkt signal på masseutsendt nyhetsbrev.
  if (headers?.some((h) => h.name?.toLowerCase() === "list-unsubscribe")) return true;
  return false;
}

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, navn: string): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === navn.toLowerCase());
  return h?.value ?? "";
}

/** Rekursivt uttrekk av tekstinnhold (text/plain foretrukket, text/html som fallback). Kopi av mønsteret i mulligan-triage/run.ts. */
function finnTekstDel(part: gmail_v1.Schema$MessagePart | undefined): string | null {
  if (!part) return null;
  if (part.mimeType === "text/plain" && part.body?.data) {
    return Buffer.from(part.body.data, "base64url").toString("utf8");
  }
  if (part.parts) {
    for (const p of part.parts) {
      const funnet = finnTekstDel(p);
      if (funnet) return funnet;
    }
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return Buffer.from(part.body.data, "base64url").toString("utf8").replace(/<[^>]+>/g, " ");
  }
  return null;
}

function hentEpostTekst(message: gmail_v1.Schema$Message): string {
  return finnTekstDel(message.payload) ?? message.snippet ?? "";
}

/**
 * Sender kjøre-oppsummeringen til Anders på Telegram. Samme mønster/samme
 * Meg-bot-env som scripts/mulligan-triage/run.ts (kopiert, ikke importert —
 * sendTelegramMessage() i src/lib/meg/telegram.ts er `server-only`-guardet).
 * Mangler env eller feiler kallet: logg og fortsett — aldri en hard
 * avhengighet.
 */
async function sendTelegramOppsummering(tekst: string): Promise<void> {
  const botToken = process.env.MEG_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MEG_TELEGRAM_ALLOWED_CHAT_ID;
  if (!botToken || !chatId) {
    console.log("[saker-gmail] Telegram-env mangler — hopper over oppsummering (se konsoll-logg over).");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: tekst }),
    });
    if (!res.ok) {
      console.error("[saker-gmail] Telegram sendMessage feilet:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[saker-gmail] Telegram-kall feilet:", err instanceof Error ? err.message : err);
  }
}

async function main() {
  const env = lesSakerInnsamlingEnv();

  const conn = await hentAdminGoogleTilkobling();
  if (!conn) {
    console.error("[saker-gmail] Ingen aktiv Google-tilkobling (ADMIN) — kan ikke hente e-post. Avbryter.");
    await sendTelegramOppsummering(
      "⚠️ Saker-innsamler (Gmail) kunne ikke kjøre: ingen aktiv Google-tilkobling. Koble til på nytt i AgencyOS.",
    );
    return;
  }

  const gmail = getGmailApi(conn);
  let meldinger: gmail_v1.Schema$Message[] = [];
  try {
    const liste = await gmail.users.messages.list({ userId: "me", q: env.gmailQuery, maxResults: 50 });
    meldinger = liste.data.messages ?? [];
  } catch (err) {
    console.error("[saker-gmail] Kunne ikke liste e-post:", err instanceof Error ? err.message : err);
    await sendTelegramOppsummering("⚠️ Saker-innsamler (Gmail) kunne ikke liste e-post fra Gmail. Sjekk manuelt.");
    return;
  }

  console.log(`[saker-gmail] Fant ${meldinger.length} e-post(er) å vurdere (søk: "${env.gmailQuery}").`);

  let nyeSaker = 0;
  let hoppetOverDuplikat = 0;
  let hoppetOverStoy = 0;
  let feilet = 0;

  for (const m of meldinger) {
    if (!m.id) continue;
    try {
      const finnesAllerede = await prisma.sak.findFirst({
        where: { kanal: "EPOST", kildeId: m.id },
        select: { id: true },
      });
      if (finnesAllerede) {
        hoppetOverDuplikat++;
        continue;
      }

      const full = await gmail.users.messages.get({ userId: "me", id: m.id, format: "full" });
      const headers = full.data.payload?.headers ?? undefined;
      const fra = headerValue(headers, "From");
      const emne = headerValue(headers, "Subject") || "(uten emne)";

      if (erAapenbarStoy(fra, headers)) {
        hoppetOverStoy++;
        continue;
      }

      const innhold = hentEpostTekst(full.data);
      const naa = new Date();

      await prisma.sak.create({
        data: {
          kanal: "EPOST",
          avsender: fra || null,
          emne,
          innhold,
          status: "VENTER",
          kildeId: m.id,
          frist: new Date(naa.getTime() + SAKER_SLA_TIMER * EN_TIME_MS),
          provenance: { kilde: "gmail-innsamler", kjort: naa.toISOString() },
        },
      });
      nyeSaker++;
      console.log(`[saker-gmail] Ny sak: "${emne}" (${m.id}).`);
    } catch (err) {
      feilet++;
      console.error(`[saker-gmail] Feil ved behandling av e-post ${m.id}:`, err instanceof Error ? err.message : err);
    }
  }

  const oppsummering =
    `Saker-innsamler (Gmail) ferdig: ${nyeSaker} nye saker · ${hoppetOverDuplikat} allerede i køen · ` +
    `${hoppetOverStoy} filtrert som støy · ${feilet} feilet.`;
  console.log(`[saker-gmail] ${oppsummering}`);
  await sendTelegramOppsummering(oppsummering);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[saker-gmail] Kritisk feil:", err);
    process.exit(1);
  });
