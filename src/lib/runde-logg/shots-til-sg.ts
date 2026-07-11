/**
 * Mapper LAGREDE Shot-rader (SlagWizard/UpGame-import) → SG-motorens
 * SgShot-sekvens, så Round.sg* kan autoberegnes fra slag-kjeden — både de
 * 5 hovedfeltene (beregnSgFraShots) og de 15 granulære bucketsene
 * (beregnGranulaerSgFraShots).
 *
 * Konvensjoner (speiler til-sg-shots.ts):
 *  - `distanceToPin` på slag N er START-avstanden for slaget; slag N sin
 *    distanceAfter = slag N+1 sin distanceToPin.
 *  - Slag N sitt outcome = slag N+1 sin `lie` (der ballen kom til ro).
 *  - Straffeslag (`isPenalty`) → syntetisk ekstra rad med start = slutt
 *    (SG-bidrag nøyaktig −1), samme konvensjon som til-sg-shots.ts. Raden
 *    arver slagIndex/bucket fra slaget den hører til.
 *
 * ÆRLIGHETSREGEL — returnerer null (aldri delvise tall) hvis:
 *  - noe slag mangler distanceToPin, eller
 *  - runden mangler HoleScore-rader, et scoret hull mangler slag, et hull med
 *    slag mangler score, eller `strokes` ≠ antall slag + straffer på hullet
 *    (uten det vet vi ikke at siste slag var hole-out — Shot har ingen
 *    holed-markør).
 */

import {
  beregnSg,
  kategoriEtterSlag,
  type SgCategory,
  type SgOutcome,
  type SgResultat,
  type SgShot,
} from "@/lib/domain/sg";
import { startKategori } from "./til-sg-shots";
import { akkumulerGranulaerSg, type GranulaerInput } from "./granulaer-sg";
import type { GranulaerSg } from "./types";

export type DbShotRad = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  lie: string;
  distanceToPin: number | null;
  isPenalty: boolean;
};

export type DbHoleScoreRad = {
  holeNumber: number;
  strokes: number;
};

/** ShotLie (Prisma) → SG-motorens outcome når ballen kom til ro der. */
const LIE_TIL_OUTCOME: Record<string, SgOutcome> = {
  TEE: "FAIRWAY",
  FAIRWAY: "FAIRWAY",
  SEMI_ROUGH: "ROUGH",
  ROUGH: "ROUGH",
  DEEP_ROUGH: "ROUGH",
  BUNKER: "SAND",
  GREEN: "GREEN",
  TREES: "RECOVERY",
  WATER: "RECOVERY",
  OOB: "RECOVERY",
};

/**
 * Kjede-vandringen: Shot-rader + scorekort → GranulaerInput-sekvens
 * (SgShot + slagIndex/erStraffeRad/holeNumber/bunkerStart), eller null når
 * kjeden ikke er komplett nok til ærlige tall.
 */
export function shotsTilSgShotsMedMeta(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
): GranulaerInput[] | null {
  if (shots.length === 0 || holeScores.length === 0) return null;

  const perHull = new Map<number, DbShotRad[]>();
  for (const s of shots) {
    const liste = perHull.get(s.holeNumber) ?? [];
    liste.push(s);
    perHull.set(s.holeNumber, liste);
  }
  const scorePerHull = new Map(holeScores.map((h) => [h.holeNumber, h.strokes]));

  // Full dekning begge veier: hvert scoret hull har slag, hvert slag-hull har score.
  for (const hullNr of scorePerHull.keys()) {
    if (!perHull.has(hullNr)) return null;
  }

  const ut: GranulaerInput[] = [];
  for (const [hullNr, slagListe] of perHull) {
    const strokes = scorePerHull.get(hullNr);
    if (strokes == null) return null;

    const slag = [...slagListe].sort((a, b) => a.shotNumber - b.shotNumber);
    const straffer = slag.filter((s) => s.isPenalty).length;
    // Scorekortet bekrefter hole-out: slag + straffer må matche førte slag.
    if (slag.length + straffer !== strokes) return null;

    let kategori: SgCategory = startKategori(slag[0].holePar);
    let avstand = slag[0].distanceToPin;
    if (avstand == null || avstand <= 0) return null;

    for (let i = 0; i < slag.length; i++) {
      const erSiste = i === slag.length - 1;
      // Startunderlag for slaget ligger direkte på raden (lie = spilt fra).
      const bunkerStart = slag[i].lie === "BUNKER";
      const meta = { slagIndex: i, holeNumber: hullNr, bunkerStart };

      if (slag[i].isPenalty) {
        // Straffen: ett ekstra slag uten posisjonsendring → nøyaktig −1 i
        // kategorien slaget spilles fra (outcome valgt så kategorien består).
        ut.push({
          category: kategori,
          distance: avstand,
          outcome: kategori === "PUTT" ? "GREEN" : "FAIRWAY",
          distanceAfter: avstand,
          erStraffeRad: true,
          ...meta,
        });
      }

      if (erSiste) {
        ut.push({
          category: kategori,
          distance: avstand,
          outcome: "HOLED",
          distanceAfter: null,
          erStraffeRad: false,
          ...meta,
        });
        break;
      }

      const etter = slag[i + 1].distanceToPin;
      if (etter == null || etter <= 0) return null;
      const outcome = LIE_TIL_OUTCOME[slag[i + 1].lie];
      if (!outcome) return null;

      ut.push({
        category: kategori,
        distance: avstand,
        outcome,
        distanceAfter: etter,
        erStraffeRad: false,
        ...meta,
      });
      kategori = kategoriEtterSlag(outcome, etter);
      avstand = etter;
    }
  }

  return ut;
}

/** Shot-rader + scorekort → ren SgShot-sekvens (bakoverkompatibel form). */
export function shotsTilSgShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
): SgShot[] | null {
  const medMeta = shotsTilSgShotsMedMeta(shots, holeScores);
  if (!medMeta) return null;
  return medMeta.map(({ category, distance, outcome, distanceAfter }) => ({
    category,
    distance,
    outcome,
    distanceAfter,
  }));
}

/** Hele veien til de 5 hovedtallene: null når kjeden er ufullstendig. */
export function beregnSgFraShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
): SgResultat | null {
  const sgShots = shotsTilSgShots(shots, holeScores);
  return sgShots ? beregnSg(sgShots) : null;
}

/** De 15 granulære bucketsene fra lagrede Shot-rader: null ved ufullstendig kjede. */
export function beregnGranulaerSgFraShots(
  shots: ReadonlyArray<DbShotRad>,
  holeScores: ReadonlyArray<DbHoleScoreRad>,
): GranulaerSg | null {
  const medMeta = shotsTilSgShotsMedMeta(shots, holeScores);
  return medMeta ? akkumulerGranulaerSg(medMeta) : null;
}
