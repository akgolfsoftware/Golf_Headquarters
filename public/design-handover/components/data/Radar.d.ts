import * as React from "react";
export interface RadarData { ott?: number; app?: number; arg?: number; putt?: number; }
export interface RadarProps { /** Vis Skeleton mens data lastes. */ loading?: boolean; data?: RadarData; baseline?: RadarData; min?: number; max?: number; size?: number; className?: string; style?: React.CSSProperties; }
export declare function Radar(props: RadarProps): JSX.Element;
