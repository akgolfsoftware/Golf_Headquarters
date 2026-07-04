import * as React from "react";
export type Compliance = "on" | "off" | "none" | "planned";
export interface UkeSession { time?: string; title: string; axis?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"; compliance?: Compliance; }
export interface UkeDag { date: number | null; today?: boolean; sessions?: UkeSession[]; }
export interface UkeKalenderProps { week?: UkeDag[]; onSessionClick?: (session: UkeSession) => void; className?: string; style?: React.CSSProperties; }
export declare function UkeKalender(props: UkeKalenderProps): JSX.Element;
