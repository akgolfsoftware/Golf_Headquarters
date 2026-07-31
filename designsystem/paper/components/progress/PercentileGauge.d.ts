export interface PercentileGaugeProps {
  /** 0–100 */
  value?: number;
  label?: string;
  /** Referansegruppe, f.eks. "NGF U19 · siste 12 mnd" */
  cohort?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
