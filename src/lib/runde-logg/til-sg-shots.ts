/** Mapper en faktisk slagkjede til SG-motorens start- og sluttposisjoner. */
import { kategoriForPosisjon, type SgCategory, type SgLie, type SgShot } from "@/lib/domain/sg";
import type { LoggetHull, LoggetSlag } from "./types";

export function startKategori(par: number): SgCategory {
  return par >= 4 ? "OTT" : "APP";
}

export type SgShotMedMeta = SgShot & {
  slagIndex: number;
  holeNumber: number;
  /** Beholdes for eldre visningsadaptere; straff er nå på det fysiske slaget. */
  erStraffeRad: false;
};

export function hullTilSgShots(hull: LoggetHull): SgShotMedMeta[] {
  const ut: SgShotMedMeta[] = [];
  let lie: SgLie = "TEE";
  let distanceM = hull.lengdeMeter;
  let ferdig = false;

  hull.slag.forEach((slag: LoggetSlag, i) => {
    if (ferdig) throw new Error(`Hull ${hull.holeNumber}: slag etter ball i hull`);
    const startDistanceM = slag.pinAvstand ?? distanceM;
    // Senere målt restavstand korrigerer forrige landingspunkt i samme kjede.
    if (i > 0 && slag.pinAvstand != null) ut[i - 1].endDistanceM = startDistanceM;
    const holed = slag.resultat.iHull;
    const endLie = holed ? null : slag.resultat.lie;
    const endDistanceM = holed ? 0 : slag.resultat.avstandTilHull;
    ut.push({
      category: kategoriForPosisjon(lie, startDistanceM, hull.par),
      startLie: lie,
      startDistanceM,
      endLie,
      endDistanceM,
      holed,
      penaltyStrokes: slag.straffe ? 1 : 0,
      teePar: hull.par,
      slagIndex: i,
      holeNumber: hull.holeNumber,
      erStraffeRad: false,
    });
    if (holed) ferdig = true;
    else {
      lie = slag.resultat.lie;
      distanceM = slag.resultat.avstandTilHull;
    }
  });
  if (!ferdig) throw new Error(`Hull ${hull.holeNumber}: siste slag er ikke i hull`);
  return ut;
}

export function rundeTilSgShots(hull: ReadonlyArray<LoggetHull>): SgShotMedMeta[] {
  return hull.flatMap(hullTilSgShots);
}
