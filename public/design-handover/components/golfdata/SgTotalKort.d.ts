import * as React from "react";

export interface SgTotalKortProps {
  /** SG total som visningsstreng m/ fortegn og desimal, f.eks. "+1,2". */
  verdi?: string | number;
  /** Enhet — default "slag". */
  enhet?: string;
  /** Navngitt baseline — ALLTID vist. */
  baseline?: string;
  /** Antall runder i snittet. */
  runder?: number;
  /** Trend som visningsstreng m/ fortegn, f.eks. "+0,4" → DeltaIndikator. */
  trend?: string;
  trendLabel?: string;
  /** Klarspråk-forklaring (fra «øvet»). */
  begrunnelse?: string;
  /** Benchmark-linje (kun «elite»), f.eks. "Tour-snitt: +2,4 slag". */
  benchmark?: string;
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  tomt?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SgTotalKort — SG total siste N runder mot navngitt baseline, m/ trend og
 * dybde-styrt forklaring. Score→trend→forklaring. Komponerer HeroTall +
 * DeltaIndikator (--up/--down, aldri lime). Tomt = onboarding.
 */
export declare function SgTotalKort(props: SgTotalKortProps): JSX.Element;
