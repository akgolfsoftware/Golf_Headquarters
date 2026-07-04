import * as React from "react";

export interface LengdeAvvikShot {
  /** Offline meters, +right / -left. */
  x: number;
  /** Lengdeavvik fra mål i meter, +langt / -kort. */
  y: number;
  label?: string;
}
export interface LengdeAvvikProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  shots: LengdeAvvikShot[];
  /** Meters shown from center to the outer ring (both axes). */
  range?: number;
  size?: number;
  /** Also draw a faint 2σ ellipse outside the primary 1σ shape. */
  showOuter?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export declare function LengdeAvvik(props: LengdeAvvikProps): JSX.Element;
