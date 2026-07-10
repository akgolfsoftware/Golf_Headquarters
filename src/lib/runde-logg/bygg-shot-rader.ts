/**
 * Runde-logg — Shot-rad-avledning (DB-representasjon per svingt slag).
 * Posisjonskjedet gir startposisjon per slag: slag N starter der N−1 landet.
 * Delt av lagreLoggetRunde (hel runde) og lagreHullKjede (per hull).
 */

import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import type { ShotLie, ShotType, WindDir } from "@/generated/prisma/enums";

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

export type ShotRad = {
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
};

/** Bygger Shot-radene for ett hull (posisjonskjedet gir startposisjon per slag). */
export function byggShotRader(hull: LoggetHull): ShotRad[] {
  let startLie: ShotLie = "TEE";
  let startAvstand = hull.lengdeMeter;

  return hull.slag.map((slag: LoggetSlag, i) => {
    const rad: ShotRad = {
      holeNumber: hull.holeNumber,
      holePar: hull.par,
      shotNumber: i + 1,
      club: slag.kolle ?? null,
      lie: startLie,
      distanceToPin: startAvstand,
      windDir: slag.vind ?? null,
      shotType: utledShotType(i === 0, hull.par, startLie, startAvstand),
      isPenalty: slag.straffe === true,
      mentalScore: slag.mental ?? null,
      notes: slag.notat ?? null,
    };
    if (!slag.resultat.iHull) {
      startLie = slag.resultat.lie;
      startAvstand = slag.resultat.avstandTilHull;
    }
    return rad;
  });
}
