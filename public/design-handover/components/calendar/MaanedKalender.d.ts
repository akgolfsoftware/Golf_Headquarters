import * as React from "react";

export interface MaanedOkt {
  /** Stabil id — påkrevd for DnD og fornuftige klikk. */
  id?: string;
  tittel: string;
  /** Pyramide-akse — gir farget prikk foran tittelen. */
  akse?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** Klokkeslett-etikett, f.eks. "09:00". */
  tid?: string;
}

export interface MaanedDag {
  date: number;
  /** Varme-modus: antall økter (styrer lime-intensitet). */
  sessions?: number;
  /** Piller-modus: dagens økter. */
  okter?: MaanedOkt[];
  today?: boolean;
}

export interface MaanedKalenderProps {
  year?: number;
  month?: number;
  days?: MaanedDag[];
  /** Varme-modus: valgt dato. */
  value?: number;
  onChange?: (date: number) => void;
  /** "varme" (default, dashbord) · "piller" (Notion-celler, planlegging). */
  modus?: "varme" | "piller";
  /** Maks synlige piller per celle før «+N flere». Default 3. */
  maksPiller?: number;
  /** Piller: klikk på økt (åpne peek). */
  onOktKlikk?: (okt: MaanedOkt, date: number) => void;
  /** Piller: hover-«+ Ny» i celle. */
  onNyOkt?: (date: number) => void;
  /** Piller: klikk «+N flere» (åpne dagvisning/peek-liste). */
  onVisAlle?: (date: number) => void;
  /** Piller: aktiverer DnD av piller mellom dager. Escape avbryter. */
  onFlytt?: (flytt: { id: string; fraDato: number; tilDato: number }) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Månedskalender med to moduser: varme (lime-heatmap, dashbord) og piller
 * (Notion-månedsceller m/ økt-piller, «+N flere», hover-«+ Ny», pille-DnD
 * mellom dager). Norsk uke (man først); i dag = signal.
 */
export declare function MaanedKalender(props: MaanedKalenderProps): JSX.Element;
