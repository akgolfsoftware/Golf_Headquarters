import * as React from "react";

export interface AiTipCardProps {
  /** Eyebrow label (default "AI-Caddie"). */
  eyebrow?: React.ReactNode;
  /** Appended as "· Oppdatert for {updated}" (e.g. "3 min"). */
  updated?: React.ReactNode;
  title?: React.ReactNode;
  /** Insight text — wrap a key number in <TipMetric>. */
  children?: React.ReactNode;
  /** Optional action (e.g. a Button). */
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** The AI-Caddie insight card — sparkle, mono eyebrow, subtle lime accent. */
export declare function AiTipCard(props: AiTipCardProps): JSX.Element;

export interface TipMetricProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Inline lime highlight for the one key number in an AiTipCard. */
export declare function TipMetric(props: TipMetricProps): JSX.Element;
