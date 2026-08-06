/**
 * SG-totalen som hero-tall med delta og basis — Analyse-oversikten,
 * spillerprofilen, konsollens stallkort (~8 skjermer). IKKE SgBreakdown
 * (per kategori) og IKKE KpiCard (generisk KPI) — dette kortet eier
 * SG-formatet: fortegn, komma-desimal, alltid med grunnlag.
 * Chromeless — flaten eies av Panel (K2 avventer Anders).
 */
export interface SgTotalKortProps {
  /** SG-verdi, f.eks. 2.92 → vises +2,92 */
  value: number;
  /** Endring mot forrige vindu */
  delta?: number;
  /** «vs forrige 5 runder» */
  deltaBasis?: string;
  /** «siste 5 runder · mot kategori B» — skal alltid sendes */
  basis?: string;
  compact?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
