import * as React from "react";
export type FakturaStatus = "paid" | "pending" | "overdue" | "void";
export interface FakturaRadProps { title: string; subtitle?: string; amount: string | number; currency?: string; status?: FakturaStatus; onClick?: () => void; className?: string; style?: React.CSSProperties; }
export declare function FakturaRad(props: FakturaRadProps): JSX.Element;
