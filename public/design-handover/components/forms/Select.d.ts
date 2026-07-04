import * as React from "react";
export interface SelectOption { value: any; label: string; }
export interface SelectProps { options?: (SelectOption | string)[]; value?: any; onChange?: (value: any) => void; placeholder?: string; size?: "sm" | "md" | "lg"; disabled?: boolean; className?: string; style?: React.CSSProperties; }
export declare function Select(props: SelectProps): JSX.Element;
