import * as React from "react";
export type BannerTone = "success" | "warning" | "error" | "info" | "neutral";
export interface BannerProps { tone?: BannerTone; title?: string; description?: string; action?: string; onAction?: () => void; onClose?: () => void; className?: string; style?: React.CSSProperties; }
export declare function Banner(props: BannerProps): JSX.Element;
