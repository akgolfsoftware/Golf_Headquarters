import * as React from "react";

export interface Tidsluke {
  /** Klokkeslett 24h, f.eks. "09:00". */
  tid: string;
  status?: "ledig" | "booket";
}
export interface TidsVelgerProps {
  luker: Tidsluke[];
  /** Valgt tid (styrt). */
  valgt?: string;
  onVelg?: (tid: string) => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TidsVelger — booking-tidvelger (rutenett av tidsluker). Ledig/booket/valgt,
 * 44px trykkmål, booket er disabled + gjennomstreket (farge ikke eneste bærer).
 * Tomt = «ingen ledige tider».
 */
export declare function TidsVelger(props: TidsVelgerProps): JSX.Element;
