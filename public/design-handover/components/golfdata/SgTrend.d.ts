import * as React from "react";

export interface SgPunkt { label?: string; sg: number; }
export interface SgHendelse {
  /** Punkt-indeks markøren står ved. */
  idx: number;
  /** Type hendelse (test/periodeskifte) — for evt. styling. */
  type?: "test" | "periode" | "turnering";
  /** Kort etikett vist ved markøren. */
  navn: string;
}
export interface SgTrendProps {
  punkter: SgPunkt[];
  hendelser?: SgHendelse[];
  baseline?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SgTrend — SG over tid mot nullbaseline med hendelsesmarkører (tester,
 * periodeskifter). Siste punkt uthevet i --up/--down. Tomt = onboarding.
 */
export declare function SgTrend(props: SgTrendProps): JSX.Element;
