import * as React from "react";
export interface DrawerProps { open?: boolean; title?: string; side?: "left" | "right"; onClose?: () => void; children?: React.ReactNode; footer?: React.ReactNode; className?: string; style?: React.CSSProperties; }
export declare function Drawer(props: DrawerProps): JSX.Element | null;
