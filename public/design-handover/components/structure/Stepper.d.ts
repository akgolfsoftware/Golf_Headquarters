import * as React from "react";
export type StepItem = string | { label: string };
export interface StepperProps { steps?: StepItem[]; current?: number; className?: string; style?: React.CSSProperties; }
export declare function Stepper(props: StepperProps): JSX.Element;
