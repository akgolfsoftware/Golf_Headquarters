import * as React from "react";

export interface ListRowProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Leading Lucide icon name or node. */
  icon?: string | React.ReactNode;
  /** Color of the leading icon chip. */
  iconTone?: "neutral" | "signal" | "up" | "down";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned meta (time, count, Tag…). */
  meta?: React.ReactNode;
  /** Lime unread dot at the right. */
  unread?: boolean;
  /** Trailing chevron (use for navigational rows). */
  chevron?: boolean;
  onClick?: React.MouseEventHandler;
  href?: string;
  as?: any;
}

/** Inbox / queue / task row with leading icon, title + subtext and right meta. */
export declare function ListRow(props: ListRowProps): JSX.Element;
