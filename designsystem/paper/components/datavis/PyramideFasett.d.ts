/**
 * Pyramidens fem områder som fasettrad — fordeling på tvers, valgfritt
 * klikk-filter (~7 skjermer). Rekkefølgen FYS→TEK→SLAG→SPILL→TURN er låst.
 * IKKE PyramidProgress (nivå oppover) og IKKE BudgetBar (ukebudsjett med
 * invarianter) — fasetten er fordeling + filter, uten regler.
 */
export type PyramideOmraade = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export interface PyramideFasettItem {
  area: PyramideOmraade;
  value: number;
  /** «6,5 t» eller «38 %» */
  display?: string;
}
export interface PyramideFasettProps {
  items: PyramideFasettItem[];
  /** Valgt område (filter-tilstand) */
  selected?: PyramideOmraade;
  /** Gjør fasettene klikkbare som filter */
  onSelect?: (a: PyramideOmraade) => void;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
