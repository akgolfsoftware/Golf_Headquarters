import * as React from "react";

export interface CompareChartProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  labels?: string[];
  primary: number[];
  secondary?: number[];
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  fmt?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function CompareChart(props: CompareChartProps): JSX.Element;
