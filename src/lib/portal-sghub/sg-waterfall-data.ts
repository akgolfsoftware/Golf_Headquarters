/**
 * Data-loader for Strokes Gained Hub — waterfall-visningen.
 *
 * VIKTIG dataforhold: skjemaet lagrer SG kun på runde-nivå (Round.sg*), ikke
 * per hull. Shot-tabellen har per-hull-slag (holeNumber/holePar/shotNumber),
 * men ingen per-slag-SG. Vi fabrikkerer ALDRI per-hull-SG.
 *
 * Waterfall-barene representerer derfor det datagrunnlaget faktisk støtter:
 * score-mot-par per hull (birdie = stolpe opp, bogey = stolpe ned), med
 * kumulativ score-mot-par-linje. SG-kategori-kortene (OTT/APP/ARG/PUTT) leses
 * fra runde-aggregatet mot PGA Tour-nullinjen.
 */

import { prisma } from "@/lib/prisma";

export type WaterfallHole = {
  hole: number;
  par: number;
  /** Antall slag på hullet (kun hull med registrerte slag). */
  strokes: number;
  /** strokes − par. Negativ = under par (bra), positiv = over par. */
  toPar: number;
  /** Kumulativ score-mot-par til og med dette hullet. */
  cumToPar: number;
};

export type SgCategory = {
  key: "ott" | "app" | "arg" | "putt";
  label: string;
  short: string;
  value: number | null;
};

export type NineSummary = {
  label: string;
  parsumm: number;
  score: number;
  toPar: number;
  holes: number;
};

export type WaterfallData = {
  state: "empty" | "low" | "full";
  roundId: string | null;
  courseName: string | null;
  playedAt: Date | null;
  coursePar: number | null;
  roundScore: number | null;
  /** Antall hull med registrerte slag (datagrunnlaget for waterfall). */
  holesLogged: number;
  holes: WaterfallHole[];
  categories: SgCategory[];
  sgTotal: number | null;
  /** Beste/verste hull etter score-mot-par (indeks i `holes`). */
  bestHoleIdx: number | null;
  worstHoleIdx: number | null;
  front: NineSummary | null;
  back: NineSummary | null;
};

const CATEGORY_META: { key: SgCategory["key"]; label: string; short: string }[] = [
  { key: "ott", label: "Off-the-tee", short: "TEE" },
  { key: "app", label: "Innspill", short: "APP" },
  { key: "arg", label: "Around-green", short: "ATG" },
  { key: "putt", label: "Putting", short: "PUTT" },
];

function emptyData(): WaterfallData {
  return {
    state: "empty",
    roundId: null,
    courseName: null,
    playedAt: null,
    coursePar: null,
    roundScore: null,
    holesLogged: 0,
    holes: [],
    categories: CATEGORY_META.map((c) => ({ ...c, value: null })),
    sgTotal: null,
    bestHoleIdx: null,
    worstHoleIdx: null,
    front: null,
    back: null,
  };
}

function nineSummary(label: string, holes: WaterfallHole[]): NineSummary | null {
  if (holes.length === 0) return null;
  const parsumm = holes.reduce((acc, h) => acc + h.par, 0);
  const score = holes.reduce((acc, h) => acc + h.strokes, 0);
  return { label, parsumm, score, toPar: score - parsumm, holes: holes.length };
}

/**
 * Henter siste runde med slag-for-slag-data og bygger waterfall-grunnlaget.
 * Returnerer alltid et objekt — `state` styrer hva UI viser.
 */
export async function lastSgWaterfall(userId: string): Promise<WaterfallData> {
  // Vi vil ha siste runde som faktisk har slag registrert. Hent de siste
  // rundene og velg den første med slag — billigere enn en distinct-spørring.
  const rounds = await prisma.round.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 10,
    include: {
      course: { select: { name: true, par: true } },
      shots: {
        orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }],
        select: { holeNumber: true, holePar: true },
      },
    },
  });

  const round = rounds.find((r) => r.shots.length > 0);
  if (!round) return emptyData();

  // Aggreger slag per hull → strokes = antall slag.
  const byHole = new Map<number, { par: number; strokes: number }>();
  for (const s of round.shots) {
    const cur = byHole.get(s.holeNumber);
    if (cur) cur.strokes += 1;
    else byHole.set(s.holeNumber, { par: s.holePar, strokes: 1 });
  }

  let cum = 0;
  const holes: WaterfallHole[] = [...byHole.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hole, { par, strokes }]) => {
      const toPar = strokes - par;
      cum += toPar;
      return { hole, par, strokes, toPar, cumToPar: cum };
    });

  // Beste = mest under par, verste = mest over par.
  let bestHoleIdx: number | null = null;
  let worstHoleIdx: number | null = null;
  holes.forEach((h, i) => {
    if (bestHoleIdx === null || h.toPar < holes[bestHoleIdx].toPar) bestHoleIdx = i;
    if (worstHoleIdx === null || h.toPar > holes[worstHoleIdx].toPar) worstHoleIdx = i;
  });
  // Ingen poeng å markere hvis det ikke finnes spredning.
  if (bestHoleIdx !== null && holes[bestHoleIdx].toPar >= 0) bestHoleIdx = null;
  if (worstHoleIdx !== null && holes[worstHoleIdx].toPar <= 0) worstHoleIdx = null;

  const front = nineSummary("Front 9", holes.filter((h) => h.hole <= 9));
  const back = nineSummary("Back 9", holes.filter((h) => h.hole > 9));

  const categories: SgCategory[] = CATEGORY_META.map((c) => ({
    ...c,
    value:
      c.key === "ott"
        ? round.sgOtt
        : c.key === "app"
          ? round.sgApp
          : c.key === "arg"
            ? round.sgArg
            : round.sgPutt,
  }));

  return {
    state: holes.length < 18 ? "low" : "full",
    roundId: round.id,
    courseName: round.course.name,
    playedAt: round.playedAt,
    coursePar: round.course.par,
    roundScore: round.score,
    holesLogged: holes.length,
    holes,
    categories,
    sgTotal: round.sgTotal,
    bestHoleIdx,
    worstHoleIdx,
    front,
    back,
  };
}
