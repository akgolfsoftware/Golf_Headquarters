/**
 * Deterministic coach colors for AgencyOS calendar (multi-coach).
 * Same coachId always maps to the same accent — no DB round-trip.
 *
 * Palette is deliberately distinct on both light and dark Paper surfaces.
 * Not merkevare-tokens: these are calendar-only identity colors.
 */

export type CoachColor = {
  /** Solid stripe / dot */
  accent: string;
  /** Soft fill (chip background) */
  soft: string;
  /** Readable label on soft */
  label: string;
};

const PALETTE: CoachColor[] = [
  { accent: "#3B82F6", soft: "color-mix(in srgb, #3B82F6 14%, transparent)", label: "#1E40AF" },
  { accent: "#8B5CF6", soft: "color-mix(in srgb, #8B5CF6 14%, transparent)", label: "#5B21B6" },
  { accent: "#14B8A6", soft: "color-mix(in srgb, #14B8A6 14%, transparent)", label: "#0F766E" },
  { accent: "#F59E0B", soft: "color-mix(in srgb, #F59E0B 16%, transparent)", label: "#B45309" },
  { accent: "#EC4899", soft: "color-mix(in srgb, #EC4899 14%, transparent)", label: "#9D174D" },
  { accent: "#22C55E", soft: "color-mix(in srgb, #22C55E 14%, transparent)", label: "#15803D" },
  { accent: "#06B6D4", soft: "color-mix(in srgb, #06B6D4 14%, transparent)", label: "#0E7490" },
  { accent: "#F97316", soft: "color-mix(in srgb, #F97316 16%, transparent)", label: "#C2410C" },
];

const FALLBACK: CoachColor = {
  accent: "#94A3B8",
  soft: "color-mix(in srgb, #94A3B8 14%, transparent)",
  label: "#475569",
};

/** Stable 32-bit hash of coachId (FNV-1a). */
export function hashCoachId(coachId: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < coachId.length; i++) {
    h ^= coachId.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function coachColorFor(coachId: string | null | undefined): CoachColor {
  if (!coachId) return FALLBACK;
  return PALETTE[hashCoachId(coachId) % PALETTE.length]!;
}

/** Alias used in some call sites. */
export function getCoachColor(coachId: string | null | undefined): CoachColor {
  return coachColorFor(coachId);
}
