import * as React from "react";

export interface LiveStatusProps {
  status?: "live" | "pause" | "ferdig";
  /** Økt-timer som visningsstreng, f.eks. "42:18" (kalleren teller). */
  tid?: string;
  /** Antall deltakere (valgfritt). */
  deltakere?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LiveStatus — live-økt-indikator + timer. LIVE = pulserende prikk (respekterer
 * prefers-reduced-motion) + løpende tid. Status via ord + farge (ikke bare farge).
 */
export declare function LiveStatus(props: LiveStatusProps): JSX.Element;
