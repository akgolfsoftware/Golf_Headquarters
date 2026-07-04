import * as React from "react";

export interface TestResultatKortProps {
  navn: string;
  /** Protokollkode/-navn, f.eks. "PEI-batteri" / "Wedge matrix". */
  protokoll?: string;
  /** Pyramideområde — venstrekant + etikett-farge. */
  omrade?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  verdi: string | number;
  enhet?: string;
  /** Krav/målverdi (visningsstreng). */
  krav?: string;
  /** Bestått mot krav (styrer bestått/ikke-bestått + farge). */
  bestatt?: boolean;
  /** Trend m/ fortegn → DeltaIndikator. */
  trend?: string;
  invertert?: boolean;
  /** Arena-badge, f.eks. "M2 · Kravtrening". */
  arena?: string;
  /** Press-badge, f.eks. "PR2". */
  press?: string;
  dato?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TestResultatKort — generisk for alle 20 testprotokoller: verdi vs krav
 * (bestått/ikke, ikon + ord), pyramideområde-farge, trend, M/PR-badge.
 */
export declare function TestResultatKort(props: TestResultatKortProps): JSX.Element;
