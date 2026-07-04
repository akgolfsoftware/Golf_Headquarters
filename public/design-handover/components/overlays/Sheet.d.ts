import * as React from "react";
export interface SheetProps { open?: boolean; title?: string; onClose?: () => void; children?: React.ReactNode; footer?: React.ReactNode; className?: string; style?: React.CSSProperties; }
export declare function Sheet(props: SheetProps): JSX.Element | null;
