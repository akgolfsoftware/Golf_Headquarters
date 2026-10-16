import type { SgBaselinePoint, SgCategory, SgLie } from "../../domain/sg";

/** Syntetiske, håndregnbare kurver. Skal aldri publiseres som et referansesett. */
export const SG_TEST_POINTS: SgBaselinePoint[] = [];

function curve(phase: SgCategory, lie: SgLie, teePar: number, start: number, slope: number) {
  for (const distanceM of [0, 1, 2, 3, 5, 10, 20, 30, 50, 60, 100, 120, 150, 180, 200, 300, 350, 400, 500]) {
    SG_TEST_POINTS.push({ phase, lie, teePar, distanceM,
      expectedStrokes: distanceM === 0 ? 0 : start + distanceM * slope });
  }
}

curve("OTT", "TEE", 4, 2.5, 0.005);
curve("OTT", "TEE", 5, 2.9, 0.005);
curve("APP", "TEE", 3, 2.2, 0.005);
for (const lie of ["FAIRWAY", "SEMI_ROUGH", "ROUGH", "DEEP_ROUGH", "BUNKER", "TREES"] as const) {
  const offset = lie === "FAIRWAY" ? 0 : lie === "BUNKER" ? 0.4 : 0.2;
  curve("APP", lie, 0, 2 + offset, 0.006);
  curve("ARG", lie, 0, 2 + offset, 0.01);
}
curve("PUTT", "GREEN", 0, 1, 0.2);
