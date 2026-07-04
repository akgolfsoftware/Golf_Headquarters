import * as React from "react";

export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
  /** Color role. */
  tone?: "muted" | "default" | "signal";
  as?: any;
}

/** Mono-caps mini-label — sits above numbers and marks sections. */
export declare function Eyebrow(props: EyebrowProps): JSX.Element;
