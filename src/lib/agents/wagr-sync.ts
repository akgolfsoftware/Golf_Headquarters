// wagr-sync: cron-agent + «Synk nå»-action for WAGR-rankinger.
//
// To trinn per kjøring:
//   1. Ekstern henting fra wagr.com — godkjent av Anders 2026-07-12 (skånsom
//      ukentlig henting: én forespørsel per spiller, sekvensielt med pause,
//      identifiserende User-Agent). Profilsidene er server-rendret Next.js;
//      dataene leses fra __NEXT_DATA__-JSON i HTML-en og valideres med zod.
//      Demo-slugs (demo-*) finnes ikke på wagr.com og hoppes over.
//   2. Lokal matching — kobler WagrSnapshot-rader uten userId til aktive
//      PLAYER-brukere på normalisert fullt navn. Kun entydige treff kobles;
//      navnekollisjoner rapporteres i output i stedet for å gjettes.
//
// Idempotent: upsert per wagrPlayerSlug; moveDelta røres bare når rank faktisk
// endres, så en dobbeltkjøring nuller ikke ukens bevegelse.

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapTilNgfKategori } from "@/lib/wagr/ngf-kategori";
import { runAgent } from "./agent-runner";

export const AGENT_NAME = "wagr-sync";

const PAUSE_MELLOM_KALL_MS = 700;
const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = "AK Golf HQ wagr-sync (kontakt: akgolfgroup@gmail.com)";

export type WagrProfil = {
  wagrPlayerSlug: string;
  fullName: string;
  rank: number;
  ptsAvg: number;
  divisor: number;
  wins?: number;
  top10s?: number;
  bestRank?: number | null;
  countingEvents?: number;
  // metadata-felt fra profilen (schema-kommentaren på WagrSnapshot nevner disse)
  graduationYear?: number | null;
  school?: string | null;
  hometown?: string | null;
};

export type WagrSyncResultat = {
  kilde: "wagr.com";
  hentet: number;
  oppdatert: number;
  ikkeFunnet: string[];
  blittProff: string[];
  feilet: string[];
  nyKoblet: number;
  tvetydige: string[];
  kobledeTotalt: number;
};

// ---------------------------------------------------------------------------
// Ekstern henting fra wagr.com
// ---------------------------------------------------------------------------

/** Formen på playerProfileData i __NEXT_DATA__ på wagr.com-profilsider. */
const ProfilDataSchema = z.object({
  name: z.string().min(1),
  // Proffer står igjen med position 0 og isPro=true
  position: z.number().int().nonnegative(),
  isPro: z.boolean().nullish(),
  pointsAverage: z.union([z.string(), z.number()]),
  divisor: z.number().nullish(),
  playerStatisticsInfo: z
    .object({
      bestRanking: z.number().nullish(),
      wins: z.number().nullish(),
      top10Finishes: z.number().nullish(),
      countingEvents: z.number().nullish(),
    })
    .nullish(),
  graduationYear: z.number().nullish(),
  school: z.string().nullish(),
  hometown: z.string().nullish(),
});

const NextDataSchema = z.object({
  props: z.object({
    pageProps: z.object({
      playerProfileComponent: z.object({
        playerProfileComponentModel: z.object({
          playerProfileData: ProfilDataSchema,
        }),
      }),
    }),
  }),
});

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Hent én spillerprofil. Returnerer "ikke-funnet" ved redirect/404 (slug
 * finnes ikke lenger på wagr.com), "proff" når spilleren har gått ut av
 * amatørrankingen, og kaster ved nettverks-/parsefeil.
 */
async function hentProfil(
  slug: string
): Promise<WagrProfil | "ikke-funnet" | "proff"> {
  const res = await fetch(`https://www.wagr.com/playerprofile/${slug}`, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "manual",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if ((res.status >= 300 && res.status < 400) || res.status === 404) {
    return "ikke-funnet";
  }
  if (!res.ok) throw new Error(`wagr.com svarte ${res.status} for ${slug}`);

  const html = await res.text();
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) throw new Error(`fant ikke __NEXT_DATA__ for ${slug}`);

  const parsed = NextDataSchema.safeParse(JSON.parse(match[1]));
  if (!parsed.success) {
    throw new Error(`uventet profil-format for ${slug}`);
  }

  const p =
    parsed.data.props.pageProps.playerProfileComponent
      .playerProfileComponentModel.playerProfileData;
  if (p.isPro || p.position === 0) return "proff";

  const ptsAvg = Number(p.pointsAverage);
  if (!Number.isFinite(ptsAvg)) {
    throw new Error(`ugyldig pointsAverage for ${slug}`);
  }

  return {
    wagrPlayerSlug: slug,
    fullName: p.name,
    rank: p.position,
    ptsAvg,
    divisor: p.divisor ?? 0,
    wins: p.playerStatisticsInfo?.wins ?? undefined,
    top10s: p.playerStatisticsInfo?.top10Finishes ?? undefined,
    bestRank: p.playerStatisticsInfo?.bestRanking ?? null,
    countingEvents: p.playerStatisticsInfo?.countingEvents ?? undefined,
    graduationYear: p.graduationYear,
    school: p.school,
    hometown: p.hometown,
  };
}

/**
 * Skånsom sekvensiell henting: én forespørsel om gangen med pause mellom.
 * Én feilet spiller stopper ikke resten.
 */
async function hentEksterneProfiler(slugs: string[]): Promise<{
  profiler: WagrProfil[];
  ikkeFunnet: string[];
  blittProff: string[];
  feilet: string[];
}> {
  const profiler: WagrProfil[] = [];
  const ikkeFunnet: string[] = [];
  const blittProff: string[] = [];
  const feilet: string[] = [];

  for (const [i, slug] of slugs.entries()) {
    if (i > 0) await pause(PAUSE_MELLOM_KALL_MS);
    try {
      const profil = await hentProfil(slug);
      if (profil === "ikke-funnet") ikkeFunnet.push(slug);
      else if (profil === "proff") blittProff.push(slug);
      else profiler.push(profil);
    } catch {
      feilet.push(slug);
    }
  }
  return { profiler, ikkeFunnet, blittProff, feilet };
}

// ---------------------------------------------------------------------------
// Idempotent lagring + lokal matching
// ---------------------------------------------------------------------------

/**
 * Idempotent snapshot-lagring. moveDelta beregnes fra forrige rank i basen
 * (positiv = opp) og settes kun når rank endres. country røres ikke —
 * wagr.com oppgir landsnavn, ikke ISO-kode, og verdien finnes fra import.
 */
export async function oppdaterSnapshots(profiler: WagrProfil[]): Promise<number> {
  let oppdatert = 0;
  for (const p of profiler) {
    const forrige = await prisma.wagrSnapshot.findUnique({
      where: { wagrPlayerSlug: p.wagrPlayerSlug },
      select: { rank: true, metadata: true },
    });
    if (!forrige) continue; // vi henter kun slugs som allerede finnes i basen

    const eksisterendeMeta =
      forrige.metadata &&
      typeof forrige.metadata === "object" &&
      !Array.isArray(forrige.metadata)
        ? forrige.metadata
        : {};

    await prisma.wagrSnapshot.update({
      where: { wagrPlayerSlug: p.wagrPlayerSlug },
      data: {
        fullName: p.fullName,
        rank: p.rank,
        ptsAvg: p.ptsAvg,
        divisor: p.divisor,
        wins: p.wins ?? 0,
        top10s: p.top10s ?? 0,
        bestRank: p.bestRank ?? null,
        countingEvents: p.countingEvents ?? 0,
        ngfCategory: mapTilNgfKategori(p.ptsAvg),
        snapshotAt: new Date(),
        metadata: {
          ...eksisterendeMeta,
          // wagr.com sender 0 når avgangsår mangler — hopp over da
          ...(p.graduationYear ? { graduationYear: p.graduationYear } : {}),
          ...(p.school != null ? { school: p.school } : {}),
          ...(p.hometown != null ? { hometown: p.hometown } : {}),
        },
        ...(forrige.rank !== p.rank ? { moveDelta: forrige.rank - p.rank } : {}),
      },
    });
    oppdatert += 1;
  }
  return oppdatert;
}

/**
 * Marker spillere som har gått ut av amatørrankingen (blitt proff) i
 * metadata. Siste amatør-snapshot (rank/pts) bevares urørt.
 */
async function markerProffer(slugs: string[]): Promise<void> {
  for (const slug of slugs) {
    const rad = await prisma.wagrSnapshot.findUnique({
      where: { wagrPlayerSlug: slug },
      select: { metadata: true },
    });
    if (!rad) continue;
    const meta =
      rad.metadata && typeof rad.metadata === "object" && !Array.isArray(rad.metadata)
        ? rad.metadata
        : {};
    await prisma.wagrSnapshot.update({
      where: { wagrPlayerSlug: slug },
      data: { metadata: { ...meta, isPro: true } },
    });
  }
}

/** Normaliser navn for matching: småbokstaver, ett mellomrom, æ/ø/å → ae/oe/aa. */
function normaliserNavn(navn: string): string {
  return navn
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Koble snapshots uten userId til aktive spillere på entydig navnetreff. */
async function kobleUmatchede(): Promise<{ nyKoblet: number; tvetydige: string[] }> {
  const [umatchede, spillere, koblede] = await Promise.all([
    prisma.wagrSnapshot.findMany({
      where: { userId: null },
      select: { id: true, fullName: true },
    }),
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true },
    }),
    prisma.wagrSnapshot.findMany({
      where: { userId: { not: null } },
      select: { userId: true },
    }),
  ]);

  // userId er @unique på WagrSnapshot — en spiller kan bare ha ett snapshot.
  const opptatt = new Set(koblede.map((s) => s.userId));
  const perNavn = new Map<string, string[]>();
  for (const s of spillere) {
    const n = normaliserNavn(s.name);
    perNavn.set(n, [...(perNavn.get(n) ?? []), s.id]);
  }

  let nyKoblet = 0;
  const tvetydige: string[] = [];
  for (const snap of umatchede) {
    const kandidater = perNavn.get(normaliserNavn(snap.fullName)) ?? [];
    if (kandidater.length === 1 && !opptatt.has(kandidater[0])) {
      await prisma.wagrSnapshot.update({
        where: { id: snap.id },
        data: { userId: kandidater[0] },
      });
      opptatt.add(kandidater[0]);
      nyKoblet += 1;
    } else if (kandidater.length > 1) {
      tvetydige.push(snap.fullName);
    }
  }
  return { nyKoblet, tvetydige };
}

// ---------------------------------------------------------------------------
// Kjøring
// ---------------------------------------------------------------------------

export async function runWagrSync(): Promise<WagrSyncResultat> {
  const resultat: WagrSyncResultat = {
    kilde: "wagr.com",
    hentet: 0,
    oppdatert: 0,
    ikkeFunnet: [],
    blittProff: [],
    feilet: [],
    nyKoblet: 0,
    tvetydige: [],
    kobledeTotalt: 0,
  };

  await runAgent(AGENT_NAME, null, async () => {
    const snapshots = await prisma.wagrSnapshot.findMany({
      select: { wagrPlayerSlug: true },
      orderBy: { rank: "asc" },
    });
    const slugs = snapshots
      .map((s) => s.wagrPlayerSlug)
      .filter((slug) => !slug.startsWith("demo-"));

    const { profiler, ikkeFunnet, blittProff, feilet } =
      await hentEksterneProfiler(slugs);
    resultat.hentet = profiler.length;
    resultat.ikkeFunnet = ikkeFunnet;
    resultat.blittProff = blittProff;
    resultat.feilet = feilet;
    resultat.oppdatert = await oppdaterSnapshots(profiler);
    await markerProffer(blittProff);

    const matching = await kobleUmatchede();
    resultat.nyKoblet = matching.nyKoblet;
    resultat.tvetydige = matching.tvetydige;
    resultat.kobledeTotalt = await prisma.wagrSnapshot.count({
      where: { userId: { not: null } },
    });

    return { output: { ...resultat } };
  });

  return resultat;
}
