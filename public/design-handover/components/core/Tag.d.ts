import * as React from "react";

export type TagVariant =
  | "neutral"
  | "outline"
  | "signal"
  | "up"
  | "down"
  | "live";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: "sm" | "md";
  /** Show a leading status dot (always on for "live", which pulses). */
  dot?: boolean;
}

/** Mono-caps status / category pill. Radius 8. */
export declare function Tag(props: TagProps): JSX.Element;

export interface CountBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  count: React.ReactNode;
  tone?: "neutral" | "signal";
}

/** Small counter badge for queues and nav. */
export declare function CountBadge(props: CountBadgeProps): JSX.Element;
