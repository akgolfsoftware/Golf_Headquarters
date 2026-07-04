import * as React from "react";

export interface PuttBand {
  /** Avstandsbånd i fot, f.eks. "0–3 ft", "3–6 ft" (putting ALLTID ft). */
  band: string;
  /** Innslagsprosent 0–100. */
  pct: number;
  /** Baseline innslag-% (Team Norway IUP) for samme bånd. */
  baseline?: number;
}
export interface PuttModellKortProps {
  band: PuttBand[];
  baseline?: string;
  nivaa?: "nybegynner" | "ovet" | "elite";
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PuttModellKort — innslag-% per PUTT-bånd (fot) mot Team Norway IUP-baseline,
 * med prosentpoeng-avvik via DeltaIndikator. Tomt = onboarding.
 */
export declare function PuttModellKort(props: PuttModellKortProps): JSX.Element;
