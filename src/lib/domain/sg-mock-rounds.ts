import { calculateShotSG } from "./shot-sg";
import type { SgLieType } from "./sg-baseline-seed";

/** Fiktive, komplette par 72-runder for lokal statistikk- og simuleringstest. */
export const SG_MOCK_VERSION = "synthetic-sg-v1";
export const SG_MOCK_PAR = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4] as const;
const ROUND_SCORES = [71, 72, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 72] as const;

export type MockCategory = "OTT" | "APP" | "ARG" | "PUTT";
export type MockShotLie = "TEE" | "FAIRWAY" | "ROUGH" | "BUNKER" | "GREEN";
export type MockShotType = "DRIVE" | "APPROACH" | "CHIP" | "BUNKER" | "PUTT";
export type MockShot = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  lie: MockShotLie;
  distanceToPin: number;
  shotType: MockShotType;
  isPenalty: false;
  category: MockCategory;
  sg: number;
};
export type MockHoleScore = {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number;
  fairway: boolean | null;
  gir: boolean;
};
export type MockRound = {
  roundNumber: number;
  par: 72;
  score: number;
  shots: MockShot[];
  holeScores: MockHoleScore[];
  sg: Record<MockCategory, number> & { total: number };
};

type State = { lie: MockShotLie; distanceToPin: number };

function random(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 0x1_0000_0000;
  };
}

function shuffle<T>(items: readonly T[], next: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function holeStrokes(score: number, next: () => number): number[] {
  const strokes: number[] = [...SG_MOCK_PAR];
  let delta = score - 72;
  if (delta < 0) {
    for (const index of shuffle([...strokes.keys()], next).slice(0, -delta)) strokes[index]--;
  } else {
    // Én ekstra på ulike hull før et hull eventuelt får dobbeltbogey.
    for (const index of shuffle([...strokes.keys()], next)) {
      if (delta === 0) break;
      strokes[index]++;
      delta--;
    }
    for (const index of shuffle([...strokes.keys()], next)) {
      if (delta === 0) break;
      strokes[index]++;
      delta--;
    }
  }
  return strokes;
}

function state(lie: MockShotLie, distance: number): State {
  return { lie, distanceToPin: Math.round(distance * 10) / 10 };
}

function buildHole(par: number, strokes: number, next: () => number): { states: State[]; putts: number } {
  const longShots = par - 2;
  const putts = strokes === par - 1 || next() < 0.28 ? 1 : 2;
  const extraShortShots = strokes - longShots - putts;
  if (extraShortShots < 0) throw new Error("Ugyldig syntetisk hullscore");

  const teeDistance = par === 3 ? 135 + next() * 55 : par === 4 ? 330 + next() * 80 : 455 + next() * 45;
  const states: State[] = [state("TEE", teeDistance)];
  if (par === 4) states.push(state(next() < 0.2 ? "ROUGH" : "FAIRWAY", 105 + next() * 75));
  if (par === 5) {
    states.push(state(next() < 0.2 ? "ROUGH" : "FAIRWAY", 235 + next() * 55));
    states.push(state(next() < 0.2 ? "ROUGH" : "FAIRWAY", 90 + next() * 70));
  }

  if (extraShortShots > 0) {
    states.push(state(next() < 0.15 ? "BUNKER" : "ROUGH", 14 + next() * 15));
    for (let i = 1; i < extraShortShots; i++) {
      states.push(state("ROUGH", 4 + next() * 8));
    }
  }

  const firstPutt = putts === 1 ? 1.2 + next() * 1.8 : 5 + next() * 8;
  states.push(state("GREEN", firstPutt));
  if (putts === 2) states.push(state("GREEN", 0.3 + next() * 0.7));
  if (states.length !== strokes) throw new Error("Syntetisk slagkjede stemmer ikke med brutto score");
  return { states, putts };
}

function categoryAndType(index: number, longShots: number, par: number, lie: MockShotLie): {
  category: MockCategory; shotType: MockShotType;
} {
  if (lie === "GREEN") return { category: "PUTT", shotType: "PUTT" };
  if (index === 0 && par > 3) return { category: "OTT", shotType: "DRIVE" };
  if (index < longShots) return { category: "APP", shotType: "APPROACH" };
  return { category: "ARG", shotType: lie === "BUNKER" ? "BUNKER" : "CHIP" };
}

function baselineLie(lie: MockShotLie): SgLieType {
  return ({ TEE: "Tee", FAIRWAY: "Fairway", ROUGH: "Rough", BUNKER: "Sand", GREEN: "Green" } as const)[lie];
}

/** Eksakt 1000 slag fordelt på 13 komplette 18-hullsrunder. Fast frø gir samme data hver gang. */
export function generateSgMockRounds(seed = 20261002): MockRound[] {
  const next = random(seed);
  return ROUND_SCORES.map((score, roundIndex) => {
    const strokesByHole = holeStrokes(score, next);
    const shots: MockShot[] = [];
    const holeScores: MockHoleScore[] = [];
    const sg = { OTT: 0, APP: 0, ARG: 0, PUTT: 0, total: 0 };
    for (let holeIndex = 0; holeIndex < 18; holeIndex++) {
      const par = SG_MOCK_PAR[holeIndex];
      const strokes = strokesByHole[holeIndex];
      const { states, putts } = buildHole(par, strokes, next);
      holeScores.push({
        holeNumber: holeIndex + 1, par, strokes, putts,
        fairway: par === 3 ? null : states[1].lie === "FAIRWAY",
        gir: states[par - 2]?.lie === "GREEN",
      });
      for (let index = 0; index < states.length; index++) {
        const start = states[index];
        const end = states[index + 1];
        const { category, shotType } = categoryAndType(index, par - 2, par, start.lie);
        const shotSg = calculateShotSG(
          start.distanceToPin, baselineLie(start.lie),
          end?.distanceToPin ?? 0, baselineLie(end?.lie ?? "GREEN"),
        );
        sg[category] += shotSg;
        shots.push({
          holeNumber: holeIndex + 1, holePar: par, shotNumber: index + 1,
          lie: start.lie, distanceToPin: start.distanceToPin,
          shotType, isPenalty: false, category, sg: shotSg,
        });
      }
    }
    sg.total = sg.OTT + sg.APP + sg.ARG + sg.PUTT;
    if (shots.length !== score) throw new Error("Rundescore stemmer ikke med antall slag");
    return { roundNumber: roundIndex + 1, par: 72, score, shots, holeScores, sg };
  });
}
