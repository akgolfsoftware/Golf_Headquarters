import * as React from "react";
export interface SGRound { label?: string; ott?: number; app?: number; arg?: number; putt?: number; }
export interface SGTrendProps { /** Vis Skeleton mens data lastes. */ loading?: boolean; rounds?: SGRound[]; benchmark?: number; height?: number; className?: string; style?: React.CSSProperties; }
export declare function SGTrend(props: SGTrendProps): JSX.Element | null;
