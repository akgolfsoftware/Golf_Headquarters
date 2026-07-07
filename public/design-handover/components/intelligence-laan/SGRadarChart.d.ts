import * as React from 'react';

export interface SGRadarChartProps {
  /** [OTT, APP, ARG, PUTT, Consistency], each normalised 0–1. */
  player: number[];
  /** Same shape, dashed grey benchmark (e.g. PGA Tour average). */
  benchmark?: number[];
  size?: number;
  style?: React.CSSProperties;
}

/** 5-axis strokes-gained radar — solid player polygon vs dashed benchmark. */
export function SGRadarChart(props: SGRadarChartProps): JSX.Element;
