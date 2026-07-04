import * as React from "react";
export interface CheckboxProps { checked?: boolean; indeterminate?: boolean; onChange?: (checked: boolean) => void; label?: string; description?: string; disabled?: boolean; className?: string; style?: React.CSSProperties; }
export declare function Checkbox(props: CheckboxProps): JSX.Element;
