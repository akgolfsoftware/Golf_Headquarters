export interface TrendBandProps {
  data?: number[];
  /** Benchmark-bånd tegnet i --soft */
  band?: { min: number; max: number };
  /** Indeks i data som er personlig rekord — markeres med --up-prikk */
  pbIndex?: number;
  unit?: string;
  window?: string;
  width?: number;
  height?: number;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
