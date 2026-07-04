import * as React from "react";
export interface FilterItem { value: any; label: string; count?: number; axis?: string; }
export interface FilterPillsProps { filters?: FilterItem[]; value?: any; onChange?: (value: any) => void; multi?: boolean; className?: string; style?: React.CSSProperties; }
export declare function FilterPills(props: FilterPillsProps): JSX.Element;
