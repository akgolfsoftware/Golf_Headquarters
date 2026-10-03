import "server-only";
import { loadActiveAkSgModel } from "@/lib/ak-sg/active-model";
import type { AkSgBaselinePoint } from "@/lib/domain/ak-sg";
import type { SgBaselinePoint } from "./sg";
export { SG_ENGINE_VERSION } from "./sg";

function toSgPoints(points: ReadonlyArray<AkSgBaselinePoint>): SgBaselinePoint[] {
  const mapped: SgBaselinePoint[] = [];
  const add = (point: AkSgBaselinePoint, phase: SgBaselinePoint["phase"], lie: SgBaselinePoint["lie"], teePar = 0) => {
    mapped.push({ phase, lie, teePar, distanceM: point.distanceM, expectedStrokes: point.expectedStrokes });
  };

  for (const point of points) {
    switch (point.lie) {
      case "tee":
        add(point, "APP", "TEE", 3);
        for (const par of [4, 5, 6]) add(point, "OTT", "TEE", par);
        break;
      case "green": add(point, "PUTT", "GREEN"); break;
      case "fairway": add(point, point.distanceM <= 30 ? "ARG" : "APP", "FAIRWAY"); break;
      case "rough": add(point, point.distanceM <= 30 ? "ARG" : "APP", "ROUGH"); break;
      case "bunker": add(point, point.distanceM <= 30 ? "ARG" : "APP", "BUNKER"); break;
      case "recovery": add(point, point.distanceM <= 30 ? "ARG" : "APP", "TREES"); break;
    }
  }
  return mapped;
}

/** Bare den aktive, godkjente AK-modellen fra app_public kan brukes. */
export async function hentPublisertSgReferanse() {
  const model = await loadActiveAkSgModel().catch(() => null);
  if (!model) return null;
  const points = toSgPoints(model.points);
  if (points.length === 0) return null;
  return {
    id: model.versionId,
    label: "AK Golf Baseline",
    levelCode: "AK_BASELINE",
    source: "AK Golf polynomial model",
    sourceVersion: model.versionId,
    points: points satisfies SgBaselinePoint[],
  };
}

export async function hentSgReferanseForRunde(
  referenceSetId: string | null,
  modelVersionId: string | null = null,
) {
  // Old local PGA/tour reference IDs are never resolved into customer SG.
  if (referenceSetId) return null;
  const current = await hentPublisertSgReferanse();
  if (modelVersionId && current?.id !== modelVersionId) return null;
  return current;
}

export { toSgPoints as mapAkSgPointsToPlayerApp };
