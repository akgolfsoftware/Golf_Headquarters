import * as React from "react";
export interface RadioOption { value: any; label: string; description?: string; disabled?: boolean; }
export interface RadioGroupProps { options?: (RadioOption | string)[]; value?: any; onChange?: (value: any) => void; direction?: "column" | "row"; className?: string; style?: React.CSSProperties; }
export declare function RadioGroup(props: RadioGroupProps): JSX.Element;
export interface RadioProps { checked?: boolean; label?: string; description?: string; disabled?: boolean; onChange?: () => void; className?: string; }
export declare function Radio(props: RadioProps): JSX.Element;
