export interface SgBarProps {
  /** Kategori: OTT, APP, ARG, PUTT */
  label: string;
  /** SG-verdi, komma-desimal med fortegn i render (+2,92) */
  value?: number;
  benchmark?: number;
  /** Skala-maks for halv bredde */
  max?: number;
  dataOdId?: string;
}
export interface SgBreakdownProps {
  items?: { label: string; value: number; benchmark?: number }[];
  total?: number;
  window?: string;
  benchmarkLabel?: string;
  max?: number;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
