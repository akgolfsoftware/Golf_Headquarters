import * as React from "react";
export interface TooltipProps { children: React.ReactNode; label?: string; side?: "top" | "bottom" | "left" | "right"; delay?: number; }
export declare function Tooltip(props: TooltipProps): JSX.Element;
