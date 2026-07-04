import * as React from "react";
export interface AccordionItem { title: string; subtitle?: string; content: React.ReactNode; }
export interface AccordionProps { items?: AccordionItem[]; defaultOpen?: number[]; exclusive?: boolean; className?: string; style?: React.CSSProperties; }
export declare function Accordion(props: AccordionProps): JSX.Element;
