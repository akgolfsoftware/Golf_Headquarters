/**
 * Parvise søyler — spilleren (blekk) mot en sammenligning (--mid/--info-raw).
 * Før/etter, deg/benchmark, sesong/sesong (~8 skjermer). IKKE BarChart (én
 * serie) og IKKE DataTable (tre+ serier). To serier er taket.
 */
export interface ComparePair {
  label: string;
  /** Serie A — alltid spilleren/nå */
  a: number;
  /** Serie B — referansen/før */
  b: number;
  aDisplay?: string;
  bDisplay?: string;
}
export interface CompareChartProps {
  pairs: ComparePair[];
  /** Legendetekst: «Nå» / «Kategori A-krav» */
  seriesA?: string;
  seriesB?: string;
  /** Serie B som --info-raw når B er en måling, ikke en referanse */
  info?: boolean;
  max?: number;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  ariaLabel?: string;
  dataOdId?: string;
}
