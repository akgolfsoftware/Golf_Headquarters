import type { ShotData } from "./extract-shots";

export type StrikeZone = "SWEET" | "THIN" | "ROLLED" | "FAT";

export type StrikePoint = {
  shotNumber: number;
  zone: StrikeZone;
  gridX: number; // 0–9 (toe til heel)
  gridY: number; // 0–7 (topp til bunn)
};

export type StrikeResult = {
  points: StrikePoint[];
  sweetPct: number;
  avgSmash: number;
};

export const STRIKE_COLORS: Record<StrikeZone, string> = {
  SWEET: "hsl(var(--primary))",
  THIN: "hsl(var(--destructive))",
  ROLLED: "hsl(var(--accent))",
  FAT: "#0A5C8A",
};

function classifyZone(smash: number): StrikeZone {
  if (smash < 1.35) return "THIN";
  if (smash <= 1.42) return "SWEET";
  if (smash <= 1.48) return "ROLLED";
  return "FAT";
}

// faceAngle -3°…+3° → gridX 0–9 (venstre=0, høyre=9)
function toGridX(faceAngle: number): number {
  const clamped = Math.max(-3, Math.min(3, faceAngle));
  return Math.round(((clamped + 3) / 6) * 9);
}

// smash lavt→bunn (fat/thin), høyt→topp (rolled) — sweet i midten
function toGridY(smash: number): number {
  const norm = Math.max(1.25, Math.min(1.52, smash));
  // Inverter: smash 1.38 (midtsenter) → gridY 3–4
  const centered = Math.abs(norm - 1.385);
  return Math.round(Math.min(7, centered * 40));
}

export function computeStrikePattern(shots: ShotData[]): StrikeResult {
  if (shots.length === 0) {
    return { points: [], sweetPct: 0, avgSmash: 0 };
  }

  const points: StrikePoint[] = shots.map((s) => ({
    shotNumber: s.shotNumber,
    zone: classifyZone(s.smashFactor),
    gridX: toGridX(s.faceAngle),
    gridY: toGridY(s.smashFactor),
  }));

  const sweetCount = points.filter((p) => p.zone === "SWEET").length;
  const sweetPct = Math.round((sweetCount / points.length) * 100);
  const avgSmash =
    Math.round((shots.reduce((s, r) => s + r.smashFactor, 0) / shots.length) * 100) / 100;

  return { points, sweetPct, avgSmash };
}
