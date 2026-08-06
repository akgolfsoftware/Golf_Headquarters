/**
 * Generiske kategorisøyler — timer per uke, økter per område, runder per
 * måned (~12 skjermer). IKKE SgBreakdown/SgBar (SG-spesifikk, signert rundt
 * null) og IKKE LoadChart (søyler MOT et anbefalt vindu). Uten benchmark:
 * analyse-blå. Med benchmark: over = --up-raw, under = --dn 35 %.
 */
export interface BarChartItem {
  label: string;
  value: number;
  /** Formatert verdi med enhet: «6,5 t» — vis aldri råtall uten enhet */
  display?: string;
}
export interface BarChartProps {
  items: BarChartItem[];
  /** Skalatak; default største verdi */
  max?: number;
  benchmark?: number;
  benchmarkLabel?: string;
  /** 96 px plott (sidepanel) */
  low?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  /** Overstyrer det genererte tekstsammendraget */
  ariaLabel?: string;
  dataOdId?: string;
}
