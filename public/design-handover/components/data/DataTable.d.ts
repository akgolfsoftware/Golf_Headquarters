import * as React from "react";
export interface TableColumn { key: string; label: string; sortable?: boolean; mono?: boolean; delta?: boolean; width?: number | string; align?: "left" | "right" | "center"; render?: (value: any, row: any) => React.ReactNode; }
export interface DataTableProps { /** Vis Skeleton mens data lastes. */ loading?: boolean; columns?: TableColumn[]; rows?: Record<string, any>[]; sortKey?: string; sortDir?: "asc" | "desc"; onSort?: (key: string, dir: "asc" | "desc") => void; className?: string; style?: React.CSSProperties; }
export declare function DataTable(props: DataTableProps): JSX.Element;
