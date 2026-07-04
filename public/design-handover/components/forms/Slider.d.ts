import * as React from "react";
export interface SliderProps { label?: string; value?: number; min?: number; max?: number; step?: number; onChange?: (value: number) => void; formatValue?: (v: number) => string; disabled?: boolean; className?: string; style?: React.CSSProperties; }
export declare function Slider(props: SliderProps): JSX.Element;
