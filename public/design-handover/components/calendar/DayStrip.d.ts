import * as React from "react";

export interface DayStripDay {
  /** Single-letter weekday (M T O T F L S). */
  dow: string;
  date: number;
  /** Visual marker: "done" (faint dot). */
  state?: "done";
  /** Lime dot for today. */
  today?: boolean;
}

export interface DayStripProps {
  /** Days, Monday-first. Defaults to a sample week. */
  days?: DayStripDay[];
  /** Selected date (matches a day's `date`). */
  value?: number;
  onChange?: (date: number, day: DayStripDay) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Week day-strip; the selected day is a white pill, today carries a lime dot. */
export declare function DayStrip(props: DayStripProps): JSX.Element;
