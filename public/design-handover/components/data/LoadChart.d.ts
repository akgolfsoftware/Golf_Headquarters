import * as React from "react";

export interface LoadChartPoint {
  label?: string;
  value: number;
}
export interface LoadChartZone {
  from: number;
  to: number;
  color: string;
  label?: string;
}
export interface LoadChartProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  series: LoadChartPoint[];
  /** Horizontal risk bands (e.g. trygg/følg/over for ACWR). */
  zones?: LoadChartZone[];
  min?: number;
  max?: number;
  height?: number;
  fmt?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function LoadChart(props: LoadChartProps): JSX.Element;
