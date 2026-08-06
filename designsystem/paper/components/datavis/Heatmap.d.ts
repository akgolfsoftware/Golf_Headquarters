/**
 * Intensitetsmatrise med fem diskrete trinn (0–4) av analyse-blå —
 * treningsvolum uke × område, treffbilde, oppmøte (~6 skjermer).
 * IKKE DispersionMap (posisjoner på en flate) og IKKE DataTable (leselige
 * tall) — varmekartet viser MØNSTER, ikke verdier.
 */
export interface HeatmapCelle {
  /** Intensitet 0–4 (0 = tom flate) */
  v: number;
  /** Tekstverdi for title/aria: «6,5 t» */
  label?: string;
}
export interface HeatmapRad { label: string; cells: HeatmapCelle[] }
export interface HeatmapProps {
  rows: HeatmapRad[];
  colLabels?: string[];
  showScale?: boolean;
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  ariaLabel?: string;
  dataOdId?: string;
}
