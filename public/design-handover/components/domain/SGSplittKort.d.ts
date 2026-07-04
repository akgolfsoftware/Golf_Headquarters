import * as React from "react";
export interface SGAxisData { value: number; delta?: number; }
export interface SGSplittData { ott?: SGAxisData; app?: SGAxisData; arg?: SGAxisData; putt?: SGAxisData; }
export interface SGSplittKortProps { data?: SGSplittData; className?: string; style?: React.CSSProperties; }
export declare function SGSplittKort(props: SGSplittKortProps): JSX.Element;
