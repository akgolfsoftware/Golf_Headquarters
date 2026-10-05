import { formaterFortegn } from "@/lib/format-tall";

export const SG_ENGINE_VERSION = "2.0.0";

export type SgCategory = "OTT" | "APP" | "ARG" | "PUTT";
export type SgLie = "TEE" | "FAIRWAY" | "SEMI_ROUGH" | "ROUGH" | "DEEP_ROUGH" |
  "BUNKER" | "GREEN" | "WATER" | "OOB" | "TREES";

/** Ett målt punkt fra et publisert sg_reference_set. Alle avstander er meter. */
export type SgBaselinePoint = {
  phase: SgCategory;
  lie: SgLie;
  teePar: number;
  distanceM: number;
  expectedStrokes: number;
};

export type SgShot = {
  category: SgCategory;
  startLie: SgLie;
  startDistanceM: number;
  endLie: SgLie | null;
  endDistanceM: number | null;
  holed: boolean;
  penaltyStrokes: number;
  /** Par er relevant bare fra tee. Ellers brukes kurven med teePar = 0. */
  teePar: number;
};

export type SgResultat = { ott: number; app: number; arg: number; putt: number; total: number };
export type ShotSgCalculation = {
  phase: SgCategory;
  expectedStart: number;
  expectedEnd: number;
  penaltyStrokes: number;
  sgValue: number;
};
export type SgPosition = { phase: SgCategory; lie: SgLie; teePar: number; distanceM: number };

/** Lineær interpolasjon innen én kurve. Bare dokumentert nær-hull-platå er tillatt under første målepunkt. */
export function interpolerForventedeSlag(
  punkter: ReadonlyArray<SgBaselinePoint>,
  posisjon: SgPosition,
): number | null {
  if (!Number.isFinite(posisjon.distanceM) || posisjon.distanceM < 0) return null;
  const teePar = posisjon.lie === "TEE" ? posisjon.teePar : 0;
  const kurve = punkter
    .filter((punkt) => punkt.phase === posisjon.phase && punkt.lie === posisjon.lie &&
      punkt.teePar === teePar && Number.isFinite(punkt.distanceM) && punkt.distanceM >= 0 &&
      Number.isFinite(punkt.expectedStrokes) && punkt.expectedStrokes >= 0)
    .sort((a, b) => a.distanceM - b.distanceM);
  if (kurve.length === 0) return null;
  const eksakt = kurve.find((punkt) => punkt.distanceM === posisjon.distanceM);
  if (eksakt) return eksakt.expectedStrokes;
  // (0, 0) betyr ball i hull og kan ikke interpoleres mot et slag fra 0,1 m.
  // Kildekalkulatoren holder første positive punkt flatt ned til hullet for
  // andre underlag enn tee. Krev at punktet er innen 10 m fra hullet.
  const forstePositive = kurve.find((punkt) => punkt.distanceM > 0);
  if (posisjon.distanceM > 0 && forstePositive &&
      posisjon.distanceM < forstePositive.distanceM &&
      posisjon.lie !== "TEE" && forstePositive.distanceM <= 10) {
    return forstePositive.expectedStrokes;
  }
  const hoyre = kurve.findIndex((punkt) => punkt.distanceM > posisjon.distanceM);
  if (hoyre <= 0) return null;
  const venstrePunkt = kurve[hoyre - 1];
  const hoyrePunkt = kurve[hoyre];
  const andel = (posisjon.distanceM - venstrePunkt.distanceM) /
    (hoyrePunkt.distanceM - venstrePunkt.distanceM);
  return venstrePunkt.expectedStrokes +
    andel * (hoyrePunkt.expectedStrokes - venstrePunkt.expectedStrokes);
}

/** OTT gjelder bare første utslag på par 4/5; etterfølgende slag klassifiseres på nytt. */
export function kategoriForPosisjon(lie: SgLie, distanceM: number, teePar = 0): SgCategory {
  if (lie === "GREEN") return "PUTT";
  if (lie === "TEE") return teePar >= 4 ? "OTT" : "APP";
  return distanceM <= 30 ? "ARG" : "APP";
}

export function beregnShotSg(
  shot: SgShot,
  punkter: ReadonlyArray<SgBaselinePoint>,
): ShotSgCalculation | null {
  if (!Number.isInteger(shot.penaltyStrokes) || shot.penaltyStrokes < 0 || shot.penaltyStrokes > 2) return null;
  if (!Number.isFinite(shot.startDistanceM) || shot.startDistanceM <= 0) return null;
  if (shot.startLie === "TEE" && (shot.teePar < 3 || shot.teePar > 6)) return null;
  if (shot.category !== kategoriForPosisjon(shot.startLie, shot.startDistanceM, shot.teePar)) return null;
  const expectedStart = interpolerForventedeSlag(punkter, {
    phase: shot.category, lie: shot.startLie, teePar: shot.teePar,
    distanceM: shot.startDistanceM,
  });
  if (expectedStart == null) return null;

  let expectedEnd = 0;
  if (!shot.holed) {
    if (shot.endLie == null || shot.endDistanceM == null || shot.endDistanceM <= 0) return null;
    const forventet = interpolerForventedeSlag(punkter, {
      phase: kategoriForPosisjon(shot.endLie, shot.endDistanceM, shot.teePar),
      lie: shot.endLie, teePar: shot.teePar, distanceM: shot.endDistanceM,
    });
    if (forventet == null) return null;
    expectedEnd = forventet;
  } else if (shot.endLie !== null || shot.endDistanceM !== 0) {
    return null;
  }

  return {
    phase: shot.category, expectedStart, expectedEnd,
    penaltyStrokes: shot.penaltyStrokes,
    sgValue: expectedStart - expectedEnd - 1 - shot.penaltyStrokes,
  };
}

export function beregnSgPerSlag(
  shot: SgShot,
  punkter: ReadonlyArray<SgBaselinePoint>,
): number | null {
  return beregnShotSg(shot, punkter)?.sgValue ?? null;
}

/** Hele runden er ikke beregnbar hvis ett slag eller én referanse mangler. */
export function beregnSg(
  shots: ReadonlyArray<SgShot>,
  punkter: ReadonlyArray<SgBaselinePoint>,
): SgResultat | null {
  if (shots.length === 0) return null;
  const resultat: SgResultat = { ott: 0, app: 0, arg: 0, putt: 0, total: 0 };
  for (const shot of shots) {
    const beregning = beregnShotSg(shot, punkter);
    if (beregning == null) return null;
    switch (shot.category) {
      case "OTT": resultat.ott += beregning.sgValue; break;
      case "APP": resultat.app += beregning.sgValue; break;
      case "ARG": resultat.arg += beregning.sgValue; break;
      case "PUTT": resultat.putt += beregning.sgValue; break;
    }
    resultat.total += beregning.sgValue;
  }
  return resultat;
}

/** V1s avtalte Course Rating-justering mot PGA Tour-referansen 76,5. */
export function beregnTrueRoundSg(
  totalRawSg: number,
  playedCourseRating: number | null,
  holesPlayed = 18,
): number | null {
  if (holesPlayed !== 18 || playedCourseRating == null ||
      !Number.isFinite(totalRawSg) || !Number.isFinite(playedCourseRating) ||
      playedCourseRating <= 0) return null;
  return totalRawSg - (76.5 - playedCourseRating);
}

export function formaterSg(sg: number): string {
  return formaterFortegn(sg, 1);
}
