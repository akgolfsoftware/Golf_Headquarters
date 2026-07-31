/**
 * Label/verdi-par for SPESIFIKASJONER og METADATA (~10 skjermer).
 * Rendres som <dl> med <dt>/<dd>.
 *
 * IKKE for tabulære finansdata. Resultatregnskap med hierarki,
 * budsjettavvik med fargekodet prosent og kontobevegelser er
 * LedgerTable og BudgetVarianceRow i Familie 4 — se .prompt.md.
 * En komponent som løser nabojobben «godt nok» hindrer at den riktige
 * blir bygget (jf. StatusCircleRow).
 */
export interface KeyValuePair {
  key: React.ReactNode;
  value: React.ReactNode;
  /** false når verdien er tekst, ikke tall — bytter mono til --ui */
  mono?: boolean;
}
export interface KeyValueGridProps {
  items: KeyValuePair[];
  /** 2 i bredt panel · 1 i sidespalte. Container legger selv om til 1 under 420px. */
  columns?: 1 | 2;
  /** inline = nøkkel venstre, verdi høyre · stack = verdi under nøkkel (lange verdier) */
  layout?: "inline" | "stack";
  dividers?: boolean;
  dataOdId?: string;
}
