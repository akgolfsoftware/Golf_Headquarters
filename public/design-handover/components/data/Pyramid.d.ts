import * as React from "react";

export interface PyramidAxis {
  /** FYS | TEK | SLAG | SPILL | TURN */
  axis: string;
  /** Actual value (0–max). */
  value: number;
  /** Optional planned/target value — drawn as a marker line. */
  plan?: number;
}

export interface PyramidProps {
  /** Axes top→bottom (apex→base). Defaults to TURN…FYS. */
  data?: PyramidAxis[];
  /** Highlight one axis in lime. */
  activeAxis?: string;
  max?: number;
  showValues?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** The AK training pyramid (FYS/TEK/SLAG/SPILL/TURN) as a readable bar graph. */
export declare function Pyramid(props: PyramidProps): JSX.Element;
