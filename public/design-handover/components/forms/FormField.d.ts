import * as React from "react";
export interface FormFieldProps { label?: string; required?: boolean; hint?: string; error?: string; children?: React.ReactNode; htmlFor?: string; className?: string; style?: React.CSSProperties; }
export declare function FormField(props: FormFieldProps): JSX.Element;
