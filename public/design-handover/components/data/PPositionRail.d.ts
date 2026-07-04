import * as React from "react";

export type PPositionStatus = "ferdig" | "aktiv" | "planlagt";

export interface PPosition {
  id: string;
  label?: string;
  status: PPositionStatus;
}
export interface PPositionRailProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  positions: PPosition[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function PPositionRail(props: PPositionRailProps): JSX.Element;
