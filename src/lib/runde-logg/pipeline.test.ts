/**
 * DIVERGENSVAKT (steg 7): hele lagringspipelinen skal gi identisk SG som
 * direkteberegningen klienten viser.
 *
 *   Klient-visning:  LoggetHull → rundeTilSgShots → beregnSg
 *   Lagringspipeline: LoggetHull → byggShotRader (Shot-rader, som i DB)
 *                     + deriverRundeScore (HoleScore-rader)
 *                     → beregnSgFraShots / beregnGranulaerSgFraShots
 *
 * Divergerer disse, viser appen ett tall og lagrer et annet — testen er
 * porten som hindrer det. Kjøres på golden-runden fra granulaer-sg.test.ts
 * og på e2e-runden (straffe + bunker, 2 hull).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { beregnGranulaerSg } from "@/lib/runde-logg/granulaer-sg";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";
import { byggShotRader } from "@/lib/runde-logg/bygg-shot-rader";
import {
  beregnSgFraShots,
  beregnGranulaerSgFraShots,
  type DbShotRad,
} from "@/lib/runde-logg/shots-til-sg";
import type { GranulaerSg, LoggetHull } from "@/lib/runde-logg/types";

/** Golden-runden (samme som granulaer-sg.test.ts). */
const GOLDEN: LoggetHull[] = [
  {
    holeNumber: 1,
    par: 4,
    lengdeMeter: 310,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 }, straffe: true },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 0.8 } },
      { resultat: { iHull: true } },
    ],
  },
  {
    holeNumber: 2,
    par: 3,
    lengdeMeter: 150,
    slag: [
      { resultat: { iHull: false, lie: "BUNKER", avstandTilHull: 8 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 1.0 } },
      { resultat: { iHull: true } },
    ],
  },
  {
    holeNumber: 3,
    par: 5,
    lengdeMeter: 480,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 220 } },
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 90 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 12 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 2.0 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 0.7 } },
      { resultat: { iHull: true } },
    ],
  },
];

/** E2E-runden fra prod-verifiseringen (straffe-drive + bunker-save). */
const E2E: LoggetHull[] = [
  {
    holeNumber: 1,
    par: 4,
    lengdeMeter: 310,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 }, straffe: true },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 1 } },
      { resultat: { iHull: true } },
    ],
  },
  {
    holeNumber: 2,
    par: 3,
    lengdeMeter: 150,
    slag: [
      { resultat: { iHull: false, lie: "BUNKER", avstandTilHull: 10 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 1 } },
      { resultat: { iHull: true } },
    ],
  },
];

/** Pipeline: LoggetHull[] → (Shot-rader, HoleScore-rader) som lagringen skriver. */
function tilDbRepresentasjon(hull: LoggetHull[]): {
  shots: DbShotRad[];
  scores: Array<{ holeNumber: number; strokes: number }>;
} {
  const shots = hull.flatMap((h) =>
    byggShotRader(h).map((rad) => ({
      holeNumber: rad.holeNumber,
      holePar: rad.holePar,
      shotNumber: rad.shotNumber,
      lie: rad.lie,
      distanceToPin: rad.distanceToPin,
      isPenalty: rad.isPenalty,
    })),
  );
  const scores = deriverRundeScore(hull).hullScores.map((h) => ({
    holeNumber: h.holeNumber,
    strokes: h.strokes,
  }));
  return { shots, scores };
}

function sjekkRunde(navn: string, hull: LoggetHull[]) {
  const sgShots = rundeTilSgShots(hull);
  const direkte = beregnSg(sgShots);
  const direkteGran = beregnGranulaerSg(hull, sgShots);

  const { shots, scores } = tilDbRepresentasjon(hull);
  const pipeline = beregnSgFraShots(shots, scores);
  const pipelineGran = beregnGranulaerSgFraShots(shots, scores);

  assert.ok(pipeline, `${navn}: pipeline-kjeden skal være komplett`);
  assert.ok(pipelineGran, `${navn}: granulær pipeline-kjede skal være komplett`);

  for (const k of ["total", "ott", "app", "arg", "putt"] as const) {
    assert.ok(
      Math.abs(pipeline[k] - direkte[k]) < 0.005,
      `${navn} ${k}: pipeline=${pipeline[k]} direkte=${direkte[k]}`,
    );
  }
  for (const k of Object.keys(direkteGran) as Array<keyof GranulaerSg>) {
    const a: number | null = pipelineGran[k];
    const b: number | null = direkteGran[k];
    if (a == null || b == null) {
      assert.equal(a, b, `${navn} ${k}: pipeline=${a} direkte=${b}`);
    } else {
      assert.ok(Math.abs(a - b) < 0.005, `${navn} ${k}: pipeline=${a} direkte=${b}`);
    }
  }
}

describe("Divergensvakt: lagringspipeline == direkteberegning", () => {
  it("golden-runden (straffe, bunker-save, tre-putt)", () => {
    sjekkRunde("golden", GOLDEN);
  });

  it("e2e-runden (2 hull)", () => {
    sjekkRunde("e2e", E2E);
  });

  it("hvert enkelthull separat (hull-SG-chipen bruker samme motor)", () => {
    for (const h of GOLDEN) sjekkRunde(`hull ${h.holeNumber}`, [h]);
  });
});
