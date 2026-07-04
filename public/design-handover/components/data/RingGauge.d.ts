import * as React from "react";

export interface RingGaugeZone {
  from: number;
  to: number;
  color: string;
}

export interface RingGaugeProps {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: React.ReactNode;
  unit?: string;
  /** Arc color when no zone matches. Default --signal. */
  color?: string;
  /** Threshold-colored track (e.g. ACWR trygg/varsel/over) — arc itself carries meaning. */
  zones?: RingGaugeZone[];
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare function RingGauge(props: RingGaugeProps): JSX.Element;
