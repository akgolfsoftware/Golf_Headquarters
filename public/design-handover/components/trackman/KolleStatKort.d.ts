import * as React from "react";

export interface KolleStat {
  /** Måleetikett, f.eks. "Club speed". */
  label: string;
  /** Snittverdi som visningsstreng (norsk komma), f.eks. "38,5". */
  snitt: string;
  /** Konsistens (std-avvik) som visningsstreng, f.eks. "0,3". Vises som ±. */
  konsistens?: string;
  /** Enhet, f.eks. "m/s", "rpm", "m", "°". */
  enhet?: string;
}

export interface KolleStatKortProps { /** Vis Skeleton mens data lastes. */ loading?: boolean;
  /** Køllenavn, f.eks. "6-jern". */
  navn: string;
  /** Antall slag i økta. */
  antall: number;
  /** Nøkkeltall (Average + Consistency fra TrackMan-tabellen). */
  stats: KolleStat[];
  /** CS-nivå-badge utledet av club speed (kanon-kobling), f.eks. "CS60". */
  csNivaa?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Kølle-statkort — én kølles snitt ± konsistens fra en TrackMan-økt.
 * Konsistens er nøytral informasjon (muted mono ±), aldri delta-farget.
 */
export declare function KolleStatKort(props: KolleStatKortProps): JSX.Element;
