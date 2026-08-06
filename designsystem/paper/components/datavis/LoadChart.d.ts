/**
 * Belastning over tid MOT et anbefalt vindu (min–maks). Ukevolum mot
 * periodens ramme, slag mot kapasitet (~6 skjermer). IKKE BarChart (ingen
 * vindu) og IKKE BudgetBar (én ukes budsjett med invarianter i Workbench) —
 * LoadChart er historikken. Terskler flagger, sperrer aldri (invariant 1).
 */
export interface LoadChartItem {
  label: string;
  value: number;
  /** Med enhet: «6,5 t» */
  display?: string;
}
export interface LoadChartProps {
  items: LoadChartItem[];
  /** Anbefalt minimum — under tones --mid */
  min?: number;
  /** Anbefalt tak — over tones --dn (leire) */
  max?: number;
  maxScale?: number;
  /** Mono-fotnote: «vindu 5–8 t · GRUNN-perioden» */
  note?: string;
  low?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  ariaLabel?: string;
  dataOdId?: string;
}
