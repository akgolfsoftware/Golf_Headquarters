export interface GappingChartProps {
  /** Per kølle: min–max-spenn (--info-raw) og snitt (--fg-prikk), carry i meter */
  clubs?: { club: string; min: number; max: number; avg: number }[];
  /** Skala-min/max i meter */
  min?: number;
  max?: number;
  unit?: string;
  window?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
