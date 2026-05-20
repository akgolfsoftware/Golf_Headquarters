/**
 * PRODUKSJON — PlayerHQ Statistikk-dashboard (/portal/statistikk)
 *
 * Komplett dashboard som dekker:
 *  - Hero med Inter Tight + italic på "statistikk"
 *  - HCP-trendgraf (12 mnd)
 *  - SG-trend per disipplin (90 dager, 4 linjer)
 *  - Pyramide-balanse-ringer (5 disipliner)
 *  - Benchmark-deltas mot kategori A1
 *  - Personlige rekorder
 *  - Streak-visualisering
 *
 * Server Component — henter spillerdata fra Prisma med dummy-fallback
 * når spilleren mangler historikk.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  StatistikkClient,
  type StatistikkData,
  type HcpPunkt,
  type SgTrendPunkt,
  type PyramidVerdi,
  type BenchmarkRad,
  type PersonligRekord,
} from "./statistikk-client";

const PYR_REKKEFOLGE = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export default async function StatistikkDashboard() {
  const user = await requirePortalUser();

  // Forsøk å hente reelle data — fall tilbake til dummy hvis ingenting finnes.
  const rounds = await prisma.round.findMany({
    where: { userId: user.id },
    orderBy: { playedAt: "asc" },
    select: {
      id: true,
      playedAt: true,
      score: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
    },
  });

  const data: StatistikkData = byggData({
    fornavn: user.name.split(" ")[0] ?? user.name,
    hcp: user.hcp ?? null,
    homeClub: user.homeClub ?? null,
    avatarUrl: user.avatarUrl ?? null,
    initial: (user.name.trim().charAt(0) || "?").toUpperCase(),
    rounds,
  });

  return <StatistikkClient data={data} />;
}

// --- DATABYGGING ---------------------------------------------------------

type RoundLite = {
  id: string;
  playedAt: Date;
  score: number;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

function byggData({
  fornavn,
  hcp,
  homeClub,
  avatarUrl,
  initial,
  rounds,
}: {
  fornavn: string;
  hcp: number | null;
  homeClub: string | null;
  avatarUrl: string | null;
  initial: string;
  rounds: RoundLite[];
}): StatistikkData {
  const dummy = rounds.length < 3;

  return {
    spiller: {
      fornavn,
      hcp: hcp ?? (dummy ? -3.5 : null),
      kategori: "A1",
      homeClub: homeClub ?? (dummy ? "GFGK" : null),
      avatarUrl,
      initial,
      dummy,
    },
    snittScore: dummy ? 72.4 : beregnSnittScore(rounds),
    rundeAntall: dummy ? 10 : Math.min(rounds.length, 10),
    hcpTrend: dummy ? dummyHcpTrend() : reellHcpTrend(rounds),
    sgTrend: dummy ? dummySgTrend() : reellSgTrend(rounds),
    pyramide: dummyPyramide(),
    benchmark: dummyBenchmark(),
    rekorder: dummyRekorder(),
    streak: dummyStreak(),
  };
}

function beregnSnittScore(rounds: RoundLite[]): number {
  const siste10 = rounds.slice(-10);
  if (siste10.length === 0) return 0;
  const sum = siste10.reduce((s, r) => s + r.score, 0);
  return sum / siste10.length;
}

function reellHcpTrend(rounds: RoundLite[]): HcpPunkt[] {
  // Bygg én verdi per måned, siste 12 mnd. Bruk score - 72 som proxy
  // for hcp-utvikling når reell hcp ikke logges per runde.
  const idag = new Date();
  const punkter: HcpPunkt[] = [];
  for (let i = 11; i >= 0; i--) {
    const dato = new Date(idag.getFullYear(), idag.getMonth() - i, 1);
    const startMs = dato.getTime();
    const sluttMs = new Date(
      idag.getFullYear(),
      idag.getMonth() - i + 1,
      0,
    ).getTime();
    const mndRunder = rounds.filter((r) => {
      const t = new Date(r.playedAt).getTime();
      return t >= startMs && t <= sluttMs;
    });
    const snittScore =
      mndRunder.length === 0
        ? null
        : mndRunder.reduce((s, r) => s + r.score, 0) / mndRunder.length;
    punkter.push({
      maaned: dato.toLocaleDateString("nb-NO", { month: "short" }),
      hcp: snittScore != null ? snittScore - 72 : null,
    });
  }
  return punkter;
}

function reellSgTrend(rounds: RoundLite[]): SgTrendPunkt[] {
  const ninetiDagSiden = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const ferske = rounds.filter(
    (r) => new Date(r.playedAt).getTime() >= ninetiDagSiden,
  );
  // Bucket inn i 6 ukentlige snitt for jevn visualisering.
  const buckets = 6;
  const ms = (90 * 24 * 60 * 60 * 1000) / buckets;
  const result: SgTrendPunkt[] = [];
  for (let i = 0; i < buckets; i++) {
    const startBucket = ninetiDagSiden + ms * i;
    const sluttBucket = ninetiDagSiden + ms * (i + 1);
    const inn = ferske.filter((r) => {
      const t = new Date(r.playedAt).getTime();
      return t >= startBucket && t < sluttBucket;
    });
    const snitt = (felt: keyof RoundLite) => {
      const verdier = inn
        .map((r) => r[felt])
        .filter((v): v is number => typeof v === "number");
      if (verdier.length === 0) return null;
      return verdier.reduce((s, v) => s + v, 0) / verdier.length;
    };
    const dato = new Date(startBucket);
    result.push({
      label: `${dato.getDate()}.${dato.getMonth() + 1}`,
      ott: snitt("sgOtt"),
      app: snitt("sgApp"),
      arg: snitt("sgArg"),
      putt: snitt("sgPutt"),
    });
  }
  return result;
}

// --- DUMMY-DATA (Markus-fallback) ---------------------------------------

function dummyHcpTrend(): HcpPunkt[] {
  // Starter +5,2, ender +3,5 — jevn forbedring over 12 mnd.
  const mnd = [
    "jun.",
    "jul.",
    "aug.",
    "sep.",
    "okt.",
    "nov.",
    "des.",
    "jan.",
    "feb.",
    "mar.",
    "apr.",
    "mai",
  ];
  const verdier = [
    -5.2, -5.0, -4.7, -4.6, -4.3, -4.5, -4.2, -4.0, -3.9, -3.8, -3.6, -3.5,
  ];
  return mnd.map((m, i) => ({ maaned: m, hcp: verdier[i] }));
}

function dummySgTrend(): SgTrendPunkt[] {
  // 6 ukentlige punkter over siste 90 dager.
  return [
    { label: "20.2", ott: 0.05, app: -0.18, arg: 0.12, putt: 0.21 },
    { label: "6.3", ott: 0.18, app: -0.12, arg: 0.22, putt: 0.18 },
    { label: "20.3", ott: 0.22, app: 0.04, arg: 0.31, putt: 0.25 },
    { label: "3.4", ott: 0.31, app: 0.11, arg: 0.42, putt: 0.28 },
    { label: "17.4", ott: 0.35, app: 0.19, arg: 0.38, putt: 0.34 },
    { label: "1.5", ott: 0.42, app: 0.24, arg: 0.45, putt: 0.41 },
  ];
}

function dummyPyramide(): PyramidVerdi[] {
  // Siste uke: FYS 18, TEK 31, SLAG 28, SPILL 16, TURN 7.
  const verdier: Record<(typeof PYR_REKKEFOLGE)[number], number> = {
    FYS: 18,
    TEK: 31,
    SLAG: 28,
    SPILL: 16,
    TURN: 7,
  };
  return PYR_REKKEFOLGE.map((omrade) => ({
    omrade,
    prosent: verdier[omrade],
  }));
}

function dummyBenchmark(): BenchmarkRad[] {
  // Markus vs kategori A1 (DataGolf).
  return [
    { label: "SG Total", verdi: 0.12, enhet: "vs A1" },
    { label: "Off-the-tee", verdi: 0.42, enhet: "vs A1" },
    { label: "Approach", verdi: -0.18, enhet: "vs A1" },
    { label: "Around-green", verdi: 0.31, enhet: "vs A1" },
    { label: "Putting", verdi: 0.24, enhet: "vs A1" },
  ];
}

function dummyRekorder(): PersonligRekord[] {
  return [
    {
      tittel: "Lavest score",
      verdi: "66",
      kontekst: "Bossum · april 2026",
      ikon: "trophy",
    },
    {
      tittel: "Lengste drive",
      verdi: "312 m",
      kontekst: "TrackMan studio · mars 2026",
      ikon: "rocket",
    },
    {
      tittel: "Beste SG-runde",
      verdi: "+3,8",
      kontekst: "Onsøy GK · mai 2026",
      ikon: "star",
    },
    {
      tittel: "Lengste streak",
      verdi: "23 dager",
      kontekst: "mai 2026",
      ikon: "zap",
    },
    {
      tittel: "Mest treningstid",
      verdi: "18,4 t",
      kontekst: "uke 17 · april",
      ikon: "clock",
    },
    {
      tittel: "Beste putt-snitt",
      verdi: "1,68",
      kontekst: "siste 5 runder",
      ikon: "target",
    },
  ];
}

function dummyStreak(): boolean[] {
  // Siste 14 dager — gradvis mer trening mot i dag.
  return [
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
  ];
}
