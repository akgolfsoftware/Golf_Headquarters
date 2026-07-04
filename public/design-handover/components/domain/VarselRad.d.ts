import * as React from "react";
export type VarselTone = "neutral" | "info" | "success" | "warning" | "error";
export interface VarselRadProps { icon?: string; tone?: VarselTone; title: string; body?: string; time?: string; unread?: boolean; onClick?: () => void; className?: string; style?: React.CSSProperties; }
export declare function VarselRad(props: VarselRadProps): JSX.Element;
