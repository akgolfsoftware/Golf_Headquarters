// sRPE (Foster-metoden): økt-RPE (1–10) × varighet i minutter = belastningspoeng.
// Brukes ved øktslutt (spillerVurdering) og senere av belastningsstyringen («Form»).
// Varighet skal alltid komme fra serverens egen liveSummary, aldri fra klienten.

export function beregnSRpe(
  rpe: number | undefined,
  durationSec: number | null,
): { durationMin: number | null; sRpe: number | null } {
  const durationMin =
    durationSec !== null && durationSec > 0
      ? Math.max(1, Math.round(durationSec / 60))
      : null;
  const sRpe = rpe !== undefined && durationMin !== null ? rpe * durationMin : null;
  return { durationMin, sRpe };
}
