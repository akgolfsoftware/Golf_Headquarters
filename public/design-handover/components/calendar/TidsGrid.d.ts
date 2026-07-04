import * as React from "react";

export interface TidsGridProps {
  /** Første og siste time på aksen (0–24). Default 7–21. */
  fraTime?: number;
  tilTime?: number;
  /** Høyde per time i px. Default 56. */
  timeHoyde?: number;
  /** Vis nå-linjen (lime). Timeverdi m/ desimal, f.eks. 14.5. Utelat for å skjule. */
  naa?: number;
  /**
   * Aktiverer drag & drop for blokker med `id`. Kalles ved slipp/tastaturflytt:
   * { id, kolonneId, fra, til } — snappet til :30. Tastatur: Alt+↑↓ = ±30 min;
   * Alt+←→ gir { …, retning: -1|1 } (kalleren bytter kolonne). Escape avbryter drag.
   * DRA NEDERSTE KANT endrer varighet: samme onFlytt med ny `til` (min 0,5t, `fra` uendret)
   * — kalleren re-validerer arena/volum live.
   */
  onFlytt?: (flytt: { id: string; kolonneId: string | null; fra: number; til: number; retning?: -1 | 1 }) => void;
  /** Kolonner: <TidsGrid.Kolonne>. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TidsGridKolonneProps {
  /** Stabil id — påkrevd for drag på tvers av kolonner. */
  id?: string;
  /** Kolonne-header, f.eks. "Man 19" eller "Bane 1". */
  header?: React.ReactNode;
  /** Marker kolonnen som i dag (header-tall får signal-pille). */
  idag?: boolean;
  /** Kalles ved klikk/Enter i tom slot med timeverdi (desimal, snappet til :30). */
  onNyOkt?: (time: number) => void;
  /** Blokker: <TidsGrid.Blokk>. */
  children?: React.ReactNode;
}

export interface TidsGridBlokkProps {
  /** Stabil id — påkrevd for at blokken skal være flyttbar (onFlytt på grid-et). */
  id?: string;
  /** Start/slutt som desimaltimer, f.eks. 9 og 10.5. */
  fra: number;
  til: number;
  /** Pyramide-akse — gir venstrekant + soft bakgrunn. */
  akse?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** Booking-tilstand (availability): åpen/holdt/booket — brukes i stedet for akse. */
  tilstand?: "apen" | "holdt" | "booket";
  onClick?: () => void;
  /** Innhold — tittel, chips osv. Grid-et eier ikke kortdesignet. */
  children?: React.ReactNode;
  /** Kolonnedeling ved overlapp: indeks og antall (settes av kalleren). */
  spor?: number;
  antallSpor?: number;
}

/**
 * Tidsgrid — dag-/ukevisning med tidsakse. Compound:
 * `TidsGrid` (akse + nå-linje) · `TidsGrid.Kolonne` (én dag/ressurs) ·
 * `TidsGrid.Blokk` (posisjonert av fra/til; innhold = children).
 * Hover/fokus i tomme slots viser «+ Ny» (Notion-mønsteret).
 */
export declare function TidsGrid(props: TidsGridProps): JSX.Element;
export declare namespace TidsGrid {
  function Kolonne(props: TidsGridKolonneProps): JSX.Element;
  function Blokk(props: TidsGridBlokkProps): JSX.Element;
}
