import * as React from "react";
import { KpiTileProps } from "./KpiTile";
export interface StatStripProps { /** Vis Skeleton mens data lastes. */ loading?: boolean; stats?: KpiTileProps[]; gap?: number; wrap?: boolean; className?: string; style?: React.CSSProperties; }
export declare function StatStrip(props: StatStripProps): JSX.Element;
