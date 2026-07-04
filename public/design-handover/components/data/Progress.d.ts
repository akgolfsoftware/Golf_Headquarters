import * as React from "react";

export interface ProgressProps {
  variant?: "ring" | "bar" | "streak" | "segment";
  /** ring/bar: current value (with `max`). */
  value?: number;
  max?: number;
  /** ring diameter (px). */
  size?: number;
  /** ring stroke width (px). */
  thickness?: number;
  label?: React.ReactNode;
  /** ring center unit (default "%"). */
  unit?: React.ReactNode;
  color?: string;
  /** streak/segment: number of dots/segments. */
  total?: number;
  /** segment: how many filled. */
  filled?: number;
  /** streak: how many active. */
  active?: number;
  /** streak: flame at the live endpoint. */
  flame?: boolean;
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Progress in four forms: ring, bar, streak (dots + flame), segment. */
export declare function Progress(props: ProgressProps): JSX.Element;
