import * as React from "react";

export interface SparklineProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  /** Series of numbers. */
  data: number[];
  width?: number;
  height?: number;
  variant?: "line" | "bar";
  /** Any CSS color (e.g. "var(--signal)"). */
  color?: string;
  strokeWidth?: number;
  /** Soft area fill under a line. */
  fill?: boolean;
  /** Draw the line/bars in on mount (respects prefers-reduced-motion). */
  animate?: boolean;
  /** Mark the last point with a small dot that glows subtly (line variant). */
  endDot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Tiny trend line / bar chart for tiles and table rows. */
export declare function Sparkline(props: SparklineProps): JSX.Element | null;
