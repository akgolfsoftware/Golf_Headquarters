import * as React from "react";
export interface ModalProps { open?: boolean; title?: string; subtitle?: string; size?: "sm" | "md" | "lg"; onClose?: () => void; children?: React.ReactNode; footer?: React.ReactNode; className?: string; style?: React.CSSProperties; }
export declare function Modal(props: ModalProps): JSX.Element | null;
