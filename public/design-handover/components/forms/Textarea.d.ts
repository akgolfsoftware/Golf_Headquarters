import * as React from "react";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { value?: string; onChange?: (value: string) => void; error?: boolean; maxLength?: number; }
export declare function Textarea(props: TextareaProps): JSX.Element;
