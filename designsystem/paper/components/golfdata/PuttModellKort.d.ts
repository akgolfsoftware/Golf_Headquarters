/**
 * Putt-modellen: make-% per distanse i FOT mot kategorireferanse
 * (~4 skjermer). CANON: putting måles i ft, aldri meter. IKKE PuttLab
 * (golfviz — én økts treningsdata) — modellen er den langsiktige kurven.
 * Chromeless — flaten eies av Panel.
 */
export interface PuttModellRad {
  /** Distanse i fot: 3, 6, 9 … */
  ft: number;
  /** Make-prosent 0–100 */
  pct: number;
  /** «68 %» */
  display: string;
  /** Referansen 0–100 */
  ref: number;
  refDisplay: string;
}
export interface PuttModellKortProps {
  rows: PuttModellRad[];
  /** «siste 90 dager · referanse kategori B» */
  basis?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
