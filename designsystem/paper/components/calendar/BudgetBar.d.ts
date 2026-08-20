/**
 * Målingslinjen over ukelerretet i Workbench: ukevolum, fordeling per
 * pyramideområde og nøkkeltall. Ren informasjon — den beskriver hva uka
 * inneholder, den vokter den ikke.
 *
 * AVGJORT 18.08.2026 (Anders): alle treningsregler er låst opp. `min`,
 * `max`, `violations` og `onOverride` er UTGÅTT og skal ikke brukes på nye
 * flater; de står igjen for eldre konsumenter. Se VOKABULAR.md.
 *
 * Komponenten regner ikke — den viser tallene den får.
 */
export interface BudgetDistribution {
  area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  hours: number;
}
export interface BudgetKeyFigure {
  /** Tallet som det skal leses: "38 %", "6,5 t", "15 år". */
  value: React.ReactNode;
  label: string;
  /** Datasemantikk. Kun når tallet i seg selv peker en retning. */
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
  /** @deprecated Utgått 18.08.2026 — ingen tak eller grenser. */
  min?: number;
  /** @deprecated Utgått 18.08.2026 — ingen tak eller grenser. */
  max?: number;
  unit?: string;
  distribution?: BudgetDistribution[];
  keyFigures?: BudgetKeyFigure[];
  /** @deprecated Utgått 18.08.2026 — planlegging valideres ikke. */
  violations?: BudgetViolation[];
  /** @deprecated Utgått 18.08.2026 — det finnes ingenting å overstyre. */
  onOverride?: (violation: BudgetViolation) => void;
  dataOdId?: string;
}
export declare function BudgetBar(props: BudgetBarProps): JSX.Element;
