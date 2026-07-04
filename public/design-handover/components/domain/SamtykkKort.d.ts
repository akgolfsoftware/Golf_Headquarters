import * as React from "react";
export type SamtykkStatus = "pending" | "approved" | "rejected";
export interface SamtykkKortProps { playerName?: string; playerAvatar?: string; type?: string; description?: string; status?: SamtykkStatus; onApprove?: () => void; onReject?: () => void; className?: string; style?: React.CSSProperties; }
export declare function SamtykkKort(props: SamtykkKortProps): JSX.Element;
