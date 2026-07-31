export interface GoalProgressProps {
  label: string;
  value?: number;
  target?: number;
  unit?: string;
  decimals?: number;
  /** Synlig tidsvindu, f.eks. "denne måneden" */
  window?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
