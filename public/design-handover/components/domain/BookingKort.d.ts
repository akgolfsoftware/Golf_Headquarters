import * as React from "react";
export type BookingState = "available" | "pending" | "confirmed" | "cancelled";
export interface BookingKortProps { type: string; date?: string; time?: string; duration?: string; location?: string; coach?: string; state?: BookingState; onBook?: () => void; onCancel?: () => void; className?: string; style?: React.CSSProperties; }
export declare function BookingKort(props: BookingKortProps): JSX.Element;
