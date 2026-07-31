export interface KpiStripeItem {
  label: string;
  value: number | string;
  unit?: string;
  window?: string;
  delta?: number;
  deltaBasis?: string;
  decimals?: number;
}
export interface KpiStripeProps {
  /** 2–5 KPI-er skilt med hairlines; kollapser til rader ≤640px */
  items?: KpiStripeItem[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
