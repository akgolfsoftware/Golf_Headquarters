import * as React from "react";

export interface ValidationChipProps {
  label: React.ReactNode;
  active?: boolean;
  /** Fill color when active (defaults to --signal). */
  color?: string;
  readOnly?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ValidationChip(props: ValidationChipProps): JSX.Element;

export type ValidationState = "ren" | "myk" | "hard";

export interface ValidationGroupProps {
  /** Mono-caps group label (e.g. the axis or field name). */
  label?: React.ReactNode;
  /** CANON validation state: ren (clean) · myk (soft breach) · hard (hard breach). */
  state?: ValidationState;
  /** Coach-facing explanation shown for myk/hard. */
  message?: React.ReactNode;
  /** Reader-facing (player/parent) plain-language explanation. Falls back to message. */
  readerMessage?: React.ReactNode;
  /** The saved override reason once committed — switches the group to its override look. */
  overridden?: string;
  /** Plan-kvalitet penalty that PERSISTS after override (hard 14 · myk 6). When set with
   *  `overridden`, shows an animated "Plan-kvalitet −N består" indicator (kanon: override
   *  lifts only the blocking, never the score penalty). */
  penalty?: number | null;
  /** Whether the current viewer may open the override flow (coach only). */
  canOverride?: boolean;
  onOverride?: (reason: string) => void;
  /** Read-only viewers (player/parent) can't act, only see the state. */
  readOnly?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ValidationGroup(props: ValidationGroupProps): JSX.Element;
