import * as React from "react";
import { TrackmanKolle } from "./DispersionPlot";

export interface TrackmanBane {
  /** Kølle-id — må matche en serie i `koller`. */
  kolle: string;
  /** Carry i meter. */
  carry: number;
  /** Toppunkt (apex) i meter. */
  apex: number;
}

export interface TrajectoryPlotProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  baner: TrackmanBane[];
  /** Seriedefinisjon (maks 5). Utledes av `baner` om utelatt. */
  koller?: TrackmanKolle[];
  /** Plot-høyde i px. Default 220. */
  hoyde?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Trajectory-plot — ballbaner (høyde × avstand), alle slag overlagt.
 * Kurver syntetiseres ballistisk fra carry + apex. Samme farge-/formspråk
 * og legend-filter som DispersionPlot. Skjermleser-sammendrag per kølle.
 */
export declare function TrajectoryPlot(props: TrajectoryPlotProps): JSX.Element;
