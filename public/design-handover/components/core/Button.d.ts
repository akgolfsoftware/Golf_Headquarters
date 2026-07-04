import * as React from "react";

export type ButtonVariant =
  | "primary"
  | "signal"
  | "secondary"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Pill button. Primary is a white pill with dark text on the dark canvas (a dark
 * pill with white text on light). Signal is the one loud lime action. Secondary
 * is a hairline outline; plus ghost and destructive.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Lucide icon name (string) or a React node, placed before the label. */
  iconLeft?: string | React.ReactNode;
  /** Lucide icon name (string) or a React node, placed after the label. */
  iconRight?: string | React.ReactNode;
  /** Full-width. */
  block?: boolean;
  /** Vis spinner og deaktiver interaksjon (aria-busy). */
  loading?: boolean;
  /** Render as another element/component (e.g. "a"). */
  as?: any;
}

export declare function Button(props: ButtonProps): JSX.Element;
