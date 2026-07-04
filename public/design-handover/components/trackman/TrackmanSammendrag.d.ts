import * as React from "react";

export interface TrackmanSammendragKolle {
  navn: string;
  antall: number;
}

export interface TrackmanSammendragProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  /** Øktdato som visningsstreng, f.eks. "6. mars 2025". */
  dato: string;
  /** Spillernavn (utelates på spillerens egen flate). */
  spiller?: string;
  /** Kilde/miljø, f.eks. "TrackMan Range". Default "TrackMan". */
  kilde?: string;
  /** Totalt antall slag i økta. */
  totalSlag: number;
  /** Køller med slag-antall — rendres som chips. */
  koller: TrackmanSammendragKolle[];
  /** Én setning coach/AI vil løfte frem, f.eks. beste konsistens. Valgfri. */
  hoydepunkt?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TrackMan økt-sammendrag — sesjonshode for /admin/trackman-listen og
 * PlayerHQ økt-detalj. Klikkbart når onClick er satt (åpner full rapport).
 */
export declare function TrackmanSammendrag(props: TrackmanSammendragProps): JSX.Element;
