// wagr-sync: cron-agent + «Synk nå»-action for WAGR-rankinger.
//
// To trinn per kjøring:
//   1. Ekstern henting — SPERRET til Anders har avklart datakilde.
//      wagr.com har ingen åpen API, og scraping-lovlighet er uavklart per
//      2026-07-12 (robots.txt er helt åpen, men vilkårene er ikke verifisert).
//      hentEksterneProfiler() returnerer null til kilden er godkjent; manuell
//      CSV/skjema-import er fortsatt primærvei. oppdaterSnapshots() er
//      plug-punktet en fremtidig kilde (eller bulk-import) kobles inn i.
//   2. Lokal matching — kobler WagrSnapshot-rader uten userId til aktive
//      PLAYER-brukere på normalisert fullt navn. Kun entydige treff kobles;
//      navnekollisjoner rapporteres i output i stedet for å gjettes.
//
// Idempotent: upsert per wagrPlayerSlug; moveDelta røres bare når rank faktisk
// endres, så en dobbeltkjøring nuller ikke ukens bevegelse.

import { prisma } from "@/lib/prisma";
import { mapTilNgfKategori } from "@/lib/wagr/ngf-kategori";
import { runAgent } from "./agent-runner";

export const AGENT_NAME = "wagr-sync";

export type WagrProfil = {
  wagrPlayerSlug: string;
  fullName: string;
  // ISO 2-letter country code
  country: string;
  rank: number;
  ptsAvg: number;
  divisor: number;
  wins?: number;
  top10s?: number;
  bestRank?: number | null;
  countingEvents?: number;
};

export type WagrSyncResultat = {
  kilde: "ikke-konfigurert" | "ekstern";
  hentet: number;
  oppdatert: number;
  nyKoblet: number;
  tvetydige: string[];
  kobledeTotalt: number;
};

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

/**
 * Ekstern WAGR-kilde. Returnerer null til Anders har avklart datakilden
 * (åpen API finnes ikke; scraping krever hans godkjenning). Når kilden er
 * avklart implementeres selve hentingen her — resten av agenten er klar.
 */
async function hentEksterneProfiler(): Promise<WagrProfil[] | null> {
  return null;
}

/**
 * Idempotent snapshot-lagring: upsert per slug. moveDelta beregnes fra forrige
 * rank i basen (positiv = opp) og settes kun når rank endres.
 */
export async function oppdaterSnapshots(profiler: WagrProfil[]): Promise<number> {
  let oppdatert = 0;
  for (const p of profiler) {
    const forrige = await prisma.wagrSnapshot.findUnique({
      where: { wagrPlayerSlug: p.wagrPlayerSlug },
      select: { rank: true },
    });
    const felles = {
      fullName: p.fullName,
      country: p.country.toLowerCase(),
      rank: p.rank,
      ptsAvg: p.ptsAvg,
      divisor: p.divisor,
      wins: p.wins ?? 0,
      top10s: p.top10s ?? 0,
      bestRank: p.bestRank ?? null,
      countingEvents: p.countingEvents ?? 0,
      ngfCategory: mapTilNgfKategori(p.ptsAvg),
      snapshotAt: new Date(),
    };
    await prisma.wagrSnapshot.upsert({
      where: { wagrPlayerSlug: p.wagrPlayerSlug },
      update: {
        ...felles,
        ...(forrige && forrige.rank !== p.rank
          ? { moveDelta: forrige.rank - p.rank }
          : {}),
      },
      create: { wagrPlayerSlug: p.wagrPlayerSlug, ...felles, moveDelta: null },
    });
    oppdatert += 1;
  }
  return oppdatert;
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

export async function runWagrSync(): Promise<WagrSyncResultat> {
  const resultat: WagrSyncResultat = {
    kilde: "ikke-konfigurert",
    hentet: 0,
    oppdatert: 0,
    nyKoblet: 0,
    tvetydige: [],
    kobledeTotalt: 0,
  };

  await runAgent(AGENT_NAME, null, async () => {
    const profiler = await hentEksterneProfiler();
    if (profiler) {
      resultat.kilde = "ekstern";
      resultat.hentet = profiler.length;
      resultat.oppdatert = await oppdaterSnapshots(profiler);
    }

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
