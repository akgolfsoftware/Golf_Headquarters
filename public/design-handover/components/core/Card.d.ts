import * as React from "react";

/**
 * The hairline base card: surface just lighter than the canvas + a 1px border,
 * radius 16, no shadow. Separation comes from lightness + border.
 */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Mono-caps eyebrow rendered in the header. */
  eyebrow?: React.ReactNode;
  /** Card title rendered in the header. */
  title?: React.ReactNode;
  /** Right-aligned header action (e.g. a Button or "Se alle →"). */
  action?: React.ReactNode;
  /** Footer content, divided by a hairline. */
  footer?: React.ReactNode;
  /** Tighter padding + smaller title for dense data. */
  compact?: boolean;
  /** Hover lift for clickable cards. */
  interactive?: boolean;
  /** Extra style applied to the body wrapper. */
  bodyStyle?: React.CSSProperties;
  as?: any;
}

export declare function Card(props: CardProps): JSX.Element;
