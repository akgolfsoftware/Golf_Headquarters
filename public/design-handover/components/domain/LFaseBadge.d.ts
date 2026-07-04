import * as React from "react";
export type LFase = "Base" | "Forberedelse" | "Spesialisering" | "Taper" | "Peak";
export interface LFaseBadgeProps { phase: LFase; style?: React.CSSProperties; className?: string; }
export declare function LFaseBadge(props: LFaseBadgeProps): JSX.Element;
