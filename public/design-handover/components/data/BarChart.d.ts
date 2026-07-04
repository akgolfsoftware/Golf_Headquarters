import * as React from "react";
export interface BarItem { label: string; value: number; active?: boolean; color?: string; }
export interface BarChartProps { /** Vis Skeleton mens data lastes. */ loading?: boolean; items?: BarItem[]; labelWidth?: number; showRank?: boolean; color?: string; maxValue?: number; formatValue?: (v: number) => string; className?: string; style?: React.CSSProperties; }
export declare function BarChart(props: BarChartProps): JSX.Element;
