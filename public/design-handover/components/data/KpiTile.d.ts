import * as React from "react";

export interface KpiTileProps {
  /** Mono-caps eyebrow label. */
  label?: React.ReactNode;
  /** The hero number (string or number) — rendered tabular mono. */
  value: React.ReactNode;
  /** Small muted unit suffix beside the number (e.g. "snitt", "kr", "%"). */
  unit?: React.ReactNode;
  /** Delta value, e.g. "+0,4" or -1.2. Sign drives the default direction. */
  delta?: React.ReactNode;
  /** Extra muted text after the delta (e.g. "vs forrige uke"). */
  deltaSuffix?: React.ReactNode;
  /** Force direction regardless of delta sign. */
  trend?: "up" | "down";
  /** Optional sparkline series shown below (draws in, lime endpoint glows on an uptrend). */
  sparkline?: number[];
  sparklineVariant?: "line" | "bar";
  /** Number size: md 36 · lg 48 · xl 60. */
  size?: "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

/** The signature metric tile — big tabular-mono number + unit + delta. */
export declare function KpiTile(props: KpiTileProps): JSX.Element;
