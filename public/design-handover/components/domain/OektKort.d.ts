import * as React from "react";
export type OektAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type OektState = "live" | "done" | "planned" | "cancelled";
export interface OektKortProps { title: string; axis?: OektAxis; time?: string; duration?: string; location?: string; coach?: string; state?: OektState; onClick?: () => void; className?: string; style?: React.CSSProperties; }
export declare function OektKort(props: OektKortProps): JSX.Element;
