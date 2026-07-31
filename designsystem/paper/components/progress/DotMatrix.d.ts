export interface DotMatrixRow {
  /** Radetikett, f.eks. "Jan" */
  label: string;
  /** Intensitet per dag: 0 = --soft, 1 = --mid (grafikk-unntaket), 2 = --fg. Aldri farge. */
  values: (0 | 1 | 2)[];
}
export interface DotMatrixProps {
  rows?: DotMatrixRow[];
  /** Tre legend-etiketter for nivåene */
  legend?: string[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
