import * as React from "react";
export interface ComboOption { value: any; label: string; }
export interface ComboboxProps { options?: (ComboOption | string)[]; value?: any; onChange?: (value: any) => void; placeholder?: string; disabled?: boolean; className?: string; style?: React.CSSProperties; }
export declare function Combobox(props: ComboboxProps): JSX.Element;
