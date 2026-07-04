import * as React from "react";
export interface EmptyStateProps { icon?: string | React.ReactNode; title?: string; description?: string; actions?: React.ReactNode; compact?: boolean; className?: string; style?: React.CSSProperties; }
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
