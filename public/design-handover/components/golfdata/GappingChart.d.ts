import * as React from "react";

export interface Kolle {
  navn: string;
  /** Carry i meter. */
  carry: number;
  /** ± carry-spredning i meter (whisker). */
  spredning?: number;
}
export interface GappingChartProps {
  koller: Kolle[];
  /** Gap-varsler (streng eller {tekst}). */
  varsler?: (string | { tekst: string })[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GappingChart — carry per kølle (meter) med ±spredning-whisker og gap-varsler
 * mellom nabo-køller. Avstander i meter (dispersion-fasit). Tomt = onboarding.
 */
export declare function GappingChart(props: GappingChartProps): JSX.Element;
