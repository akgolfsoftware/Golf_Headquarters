/**
 * Mapper loggede hull (posisjonskjedet) → SG-motorens SgShot-sekvens.
 *
 * Regler:
 *  - Første slag på hullet: distance = hull-lengde. Kategori etter PAR
 *    (Broadie-konvensjon): par 4/5 → OTT, par 3 → APP.
 *  - Videre slag: kategori fra forrige slags resultat via motorens
 *    `kategoriEtterSlag` (GREEN → PUTT, ≤30 m → ARG, ≤180 m → APP, >180 m → OTT).
 *  - Straffeslag (`straffe: true`): slaget belastes ett ekstra slag —
 *    uttrykkes som et syntetisk ekstra SgShot i samme kategori med
 *    start = slutt (SG-bidrag nøyaktig −1), slik at motorens totaler
 *    fanger straffen uten endring i motoren.
 *  - Hole-out: outcome HOLED, distanceAfter null.
 */

import {
  kategoriEtterSlag,
  type SgCategory,
  type SgOutcome,
  type SgShot,
} from "@/lib/domain/sg";
import type { HvileLie, LoggetHull, LoggetSlag } from "./types";

/** Mapper hvileposisjon-underlag → SG-motorens outcome-begrep. */
export function lieTilOutcome(lie: HvileLie): SgOutcome {
  switch (lie) {
    case "FAIRWAY":
      return "FAIRWAY";
    case "GREEN":
      return "GREEN";
    case "BUNKER":
      return "SAND";
    case "TREES":
      return "RECOVERY";
    case "SEMI_ROUGH":
    case "ROUGH":
    case "DEEP_ROUGH":
      return "ROUGH";
  }
}

/** Startkategori for hullets første slag — PAR-basert (Broadie). */
export function startKategori(par: number): SgCategory {
  return par >= 4 ? "OTT" : "APP";
}

export type SgShotMedMeta = SgShot & {
  /** Indeks i hullets slag-liste (syntetiske straffe-rader peker på slaget de hører til). */
  slagIndex: number;
  /** true for det syntetiske ekstra-slaget som representerer straffen. */
  erStraffeRad: boolean;
  holeNumber: number;
};

/**
 * Ett hull → SgShot-sekvens (med metadata for bucket-fordeling).
 * Kaster ved inkonsistent kjede (slag etter hole-out).
 */
export function hullTilSgShots(hull: LoggetHull): SgShotMedMeta[] {
  const ut: SgShotMedMeta[] = [];

  let kategori: SgCategory = startKategori(hull.par);
  let avstand = hull.lengdeMeter;
  let ferdig = false;

  hull.slag.forEach((slag: LoggetSlag, i) => {
    if (ferdig) {
      throw new Error(
        `Hull ${hull.holeNumber}: slag ${i + 1} er ført etter at ballen er i hull`,
      );
    }

    if (slag.resultat.iHull) {
      ut.push({
        category: kategori,
        distance: avstand,
        outcome: "HOLED",
        distanceAfter: null,
        slagIndex: i,
        erStraffeRad: false,
        holeNumber: hull.holeNumber,
      });
      ferdig = true;
      return;
    }

    const outcome = lieTilOutcome(slag.resultat.lie);
    const etter = slag.resultat.avstandTilHull;

    ut.push({
      category: kategori,
      distance: avstand,
      outcome,
      distanceAfter: etter,
      slagIndex: i,
      erStraffeRad: false,
      holeNumber: hull.holeNumber,
    });

    if (slag.straffe) {
      // Straffen: ett ekstra slag uten posisjonsendring → SG-bidrag nøyaktig −1
      // i kategorien slaget ble spilt fra. Outcome velges slik at motorens
      // kategoriEtterSlag lander i SAMME kategori (GREEN holder PUTT på green,
      // FAIRWAY holder OTT/APP/ARG via distanse-tersklene).
      ut.push({
        category: kategori,
        distance: avstand,
        outcome: kategori === "PUTT" ? "GREEN" : "FAIRWAY",
        distanceAfter: avstand,
        slagIndex: i,
        erStraffeRad: true,
        holeNumber: hull.holeNumber,
      });
    }

    kategori = kategoriEtterSlag(outcome, etter);
    avstand = etter;
  });

  if (!ferdig) {
    throw new Error(`Hull ${hull.holeNumber}: siste slag er ikke «i hull»`);
  }

  return ut;
}

/** Hele runden → flat SgShot-sekvens. */
export function rundeTilSgShots(hull: ReadonlyArray<LoggetHull>): SgShotMedMeta[] {
  return hull.flatMap((h) => hullTilSgShots(h));
}
