import * as React from "react";

export interface HeatmapProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  rows: string[];
  cols: string[];
  /** values[rowIndex][colIndex], 0–1 intensity. */
  values: number[][];
  /** Full-intensity color; ramps from --track. Pick one per grid (signal for load, error for risk). */
  color?: string;
  cell?: number;
  gap?: number;
  fmt?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Heatmap(props: HeatmapProps): JSX.Element;
