import * as React from "react";
export interface PopoverProps { trigger: React.ReactNode; children: React.ReactNode; side?: "bottom-start" | "bottom-end" | "bottom" | "top" | "top-start" | "top-end"; open?: boolean; onOpenChange?: (open: boolean) => void; className?: string; style?: React.CSSProperties; }
export declare function Popover(props: PopoverProps): JSX.Element;
