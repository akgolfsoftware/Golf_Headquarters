/**
 * Runde-logg — Shot-rad-avledning (DB-representasjon per svingt slag).
 * Posisjonskjedet gir startposisjon per slag: slag N starter der N−1 landet.
 * Delt av lagreLoggetRunde (hel runde) og lagreHullKjede (per hull).
 *
 * `endShotKategori` gjelder kun ikke-putt-slag (se gyldigeEndShotKategorier).
 * `puttDetail` bygges kun for PUTT-slag, med lengdeFot avledet fra
 * startAvstand (putten starter der forrige slag landet — ingen egen
 * lengde-input trengs i UI).
 */

import { randomUUID } from "node:crypto";
import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import type {
  EndShotKategori,
  PuttBreakRetning,
  PuttFartUtfall,
  PuttLinjeMiss,
  PuttSlopeAlvorlighet,
  ShotLie,
  ShotType,
  WindDir,
} from "@/generated/prisma/enums";
import { meterTilFot } from "@/lib/min-golf/format";

/** Deterministisk ShotType fra kontekst — dokumentert konvensjon, ikke gjettverk. */
export function utledShotType(
  erForsteSlag: boolean,
  par: number,
  startLie: ShotLie,
  startAvstand: number,
): ShotType {
  if (startLie === "GREEN") return "PUTT";
  if (erForsteSlag && par >= 4) return "DRIVE";
  if (startLie === "TREES") return "RECOVERY";
  if (startLie === "BUNKER" && startAvstand <= 30) return "BUNKER";
  if (startAvstand <= 12) return "CHIP";
  if (startAvstand <= 30) return "PITCH";
  return "APPROACH";
}

export type PuttDetailRad = {
  shotId: string;
  lengdeFot: number;
  breakRetning: PuttBreakRetning;
  slopeAlvorlighet: PuttSlopeAlvorlighet;
  linjeMiss: PuttLinjeMiss | null;
  fartUtfall: PuttFartUtfall;
};

export type ShotRad = {
  id: string;
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club: string | null;
  lie: ShotLie;
  distanceToPin: number;
  windDir: WindDir | null;
  shotType: ShotType;
  isPenalty: boolean;
  mentalScore: number | null;
  notes: string | null;
  endShotKategori: EndShotKategori | null;
  puttDetail: PuttDetailRad | null;
};

/** Bygger Shot-radene for ett hull (posisjonskjedet gir startposisjon per slag). */
export function byggShotRader(hull: LoggetHull): ShotRad[] {
  let startLie: ShotLie = "TEE";
  let startAvstand = hull.lengdeMeter;

  return hull.slag.map((slag: LoggetSlag, i) => {
    const id = randomUUID();
    const shotType = utledShotType(i === 0, hull.par, startLie, startAvstand);
    const erPutt = shotType === "PUTT";

    const rad: ShotRad = {
      id,
      holeNumber: hull.holeNumber,
      holePar: hull.par,
      shotNumber: i + 1,
      club: slag.kolle ?? null,
      lie: startLie,
      distanceToPin: startAvstand,
      windDir: slag.vind ?? null,
      shotType,
      isPenalty: slag.straffe === true,
      mentalScore: slag.mental ?? null,
      notes: slag.notat ?? null,
      endShotKategori: erPutt ? null : (slag.endShotKategori ?? null),
      puttDetail:
        erPutt && slag.putt
          ? {
              shotId: id,
              lengdeFot: Math.round(meterTilFot(startAvstand)),
              breakRetning: slag.putt.breakRetning,
              slopeAlvorlighet: slag.putt.slopeAlvorlighet,
              linjeMiss: slag.putt.linjeMiss ?? null,
              fartUtfall: slag.putt.fartUtfall,
            }
          : null,
    };
    if (!slag.resultat.iHull) {
      startLie = slag.resultat.lie;
      startAvstand = slag.resultat.avstandTilHull;
    }
    return rad;
  });
}

/** Skiller Shot-kolonner fra PuttDetail-rader for to separate createMany-kall. */
export function splitShotRader(
  rader: ShotRad[],
): { shots: Array<Omit<ShotRad, "puttDetail">>; putts: PuttDetailRad[] } {
  const shots: Array<Omit<ShotRad, "puttDetail">> = [];
  const putts: PuttDetailRad[] = [];
  for (const { puttDetail, ...shot } of rader) {
    shots.push(shot);
    if (puttDetail) putts.push(puttDetail);
  }
  return { shots, putts };
}
