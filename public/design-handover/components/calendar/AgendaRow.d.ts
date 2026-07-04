import * as React from "react";

export interface AgendaRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Start time, e.g. "16:00". */
  time?: React.ReactNode;
  /** Leading Lucide icon name or node. */
  icon?: string | React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Duration, e.g. "60 min". */
  duration?: React.ReactNode;
  /** "upcoming" (default) · "live" (lime accent + pulse) · "done" (dimmed + check). */
  state?: "upcoming" | "live" | "done";
  onClick?: React.MouseEventHandler;
}

/** One agenda line: time + a hairline block with icon, title and duration. */
export declare function AgendaRow(props: AgendaRowProps): JSX.Element;
