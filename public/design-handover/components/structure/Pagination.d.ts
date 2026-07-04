import * as React from "react";
export interface PaginationProps { page?: number; totalPages?: number; onChange?: (page: number) => void; className?: string; style?: React.CSSProperties; }
export declare function Pagination(props: PaginationProps): JSX.Element;
