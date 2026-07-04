import * as React from "react";

export interface PercentileBarProps {
  /** 0–100 — where the player sits in the peer distribution. */
  percentile?: number;
  /** Optional reference marker (e.g. squad average), 0–100. */
  benchmark?: number;
  label?: React.ReactNode;
  /** The headline value shown top-right (e.g. "topp 12%" or "72. persentil"). */
  valueLabel?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function PercentileBar(props: PercentileBarProps): JSX.Element;
