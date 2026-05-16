import type { ShotData } from "./extract-shots";

export type DPlaneClassification =
  | "PULL_HOOK"
  | "PULL_FADE"
  | "PUSH_DRAW"
  | "PUSH_FADE"
  | "STRAIGHT";

export type DPlanePoint = {
  shotNumber: number;
  faceAngle: number;
  clubPath: number;
  classification: DPlaneClassification;
};

export type DPlaneResult = {
  points: DPlanePoint[];
  dominantClass: DPlaneClassification;
  consistencyPct: number;
};

const TOLERANCE = 0.5; // grader

function classify(faceAngle: number, clubPath: number): DPlaneClassification {
  const faceStr = Math.abs(faceAngle) <= TOLERANCE;
  const pathStr = Math.abs(clubPath) <= TOLERANCE;
  if (faceStr && pathStr) return "STRAIGHT";

  const faceLeft = faceAngle < -TOLERANCE;
  const pathLeft = clubPath < -TOLERANCE;

  if (faceLeft && pathLeft) return "PULL_HOOK";
  if (faceLeft && !pathLeft) return "PULL_FADE";
  if (!faceLeft && pathLeft) return "PUSH_DRAW";
  return "PUSH_FADE";
}

export function computeDPlane(shots: ShotData[]): DPlaneResult {
  if (shots.length === 0) {
    return { points: [], dominantClass: "STRAIGHT", consistencyPct: 0 };
  }

  const points: DPlanePoint[] = shots.map((s) => ({
    shotNumber: s.shotNumber,
    faceAngle: s.faceAngle,
    clubPath: s.clubPath,
    classification: classify(s.faceAngle, s.clubPath),
  }));

  const counts = new Map<DPlaneClassification, number>();
  for (const p of points) {
    counts.set(p.classification, (counts.get(p.classification) ?? 0) + 1);
  }

  let dominantClass: DPlaneClassification = "STRAIGHT";
  let maxCount = 0;
  for (const [cls, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      dominantClass = cls;
    }
  }

  const consistencyPct = Math.round((maxCount / points.length) * 100);

  return { points, dominantClass, consistencyPct };
}

export const DPLANE_LABELS: Record<DPlaneClassification, string> = {
  PULL_HOOK: "Pull-Hook",
  PULL_FADE: "Pull-Fade",
  PUSH_DRAW: "Push-Draw",
  PUSH_FADE: "Push-Fade",
  STRAIGHT: "Straight",
};

export const DPLANE_COLORS: Record<DPlaneClassification, string> = {
  PULL_HOOK: "#A32D2D",
  PULL_FADE: "#0A5C8A",
  PUSH_DRAW: "#005840",
  PUSH_FADE: "#D1F843",
  STRAIGHT: "#9D9C95",
};
