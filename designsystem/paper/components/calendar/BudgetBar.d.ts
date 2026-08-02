/**
 * Budsjettlinjen over ukelerretet i Workbench. Ukevolum mot periodens
 * min/maks, fordeling per pyramideområde, nøkkeltall (TEK-%, aldersregel),
 * og invariantbrudd som ANBEFALING med «overstyr med begrunnelse».
 *
 * Komponenten regner ikke. Invariantene bor i CANON; her vises resultatet.
 */
export interface BudgetDistribution {
  area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  hours: number;
}
export interface BudgetKeyFigure {
  /** Tallet som det skal leses: "38 %", "6,5 t", "15 år". */
  value: React.ReactNode;
  label: string;
  /** Datasemantikk. Kun når tallet i seg selv er over/under et krav. */
  tone?: "up" | "dn";
}
export interface BudgetViolation {
  id?: string;
  /** Hva som brytes, i klartekst: "TEK-andelen er over taket". */
  title: React.ReactNode;
  /** Hvorfor, med tallene: regelen, verdien, konsekvensen. */
  body: React.ReactNode;
  /** Egne handlinger (f.eks. «Flytt 30 min til SLAG»). Blekk/ghost. */
  actions?: React.ReactNode;
}
export interface BudgetBarProps {
  hours: number;
  /** Periodens vindu. Tegnes som markører i sporet, ikke som farge. */
  min?: number;
  max?: number;
  unit?: string;
  distribution?: BudgetDistribution[];
  keyFigures?: BudgetKeyFigure[];
  /** Brudd vises som anbefaling. Tom liste = ingenting vises. */
  violations?: BudgetViolation[];
  /** Uten denne finnes ingen overstyringsknapp — og da må bruddet være
   *  informativt alene. Sperre er aldri et alternativ. */
  onOverride?: (violation: BudgetViolation) => void;
  dataOdId?: string;
}
export declare function BudgetBar(props: BudgetBarProps): JSX.Element;
