/**
 * AK-formelen som fargeløs mono-chip (~12 skjermer — øktkort, editor,
 * historikk). Formatet eies av CANON (v2, 17 områder) — chippen viser hva
 * den får, formaterer og validerer aldri. IKKE Chip (generisk handlingschip)
 * — formelchippen er ren visning og aldri et treffmål.
 */
export interface AKFormelChipProps {
  /** Hele formelen som én streng */
  formula?: string;
  /** Alternativ: segmenter som får ·-skilletegn: ["TEK", "TEE", "60 min"] */
  parts?: string[];
  /** Soft-fylt variant på travle flater */
  filled?: boolean;
  dataOdId?: string;
}
