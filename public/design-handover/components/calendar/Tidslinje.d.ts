import * as React from "react";

export interface TidslinjeProps {
  /** Total lengde på tidsaksen i enheter (f.eks. 52 uker). */
  total: number;
  /** Zoom-nivå — styrer tick-tetthet og etikettformat. */
  zoom?: "uke" | "maned" | "kvartal";
  /** Etiketter for aksen: { ved: enhet, tekst: "Jan" }. Utledes ikke — kalleren eier kalenderen. */
  ticks?: { ved: number; tekst: string }[];
  /** Nå-markør (enhet, desimal OK) — lime linje. Én per visning. */
  naa?: number;
  /**
   * Aktiverer drag: flytt av barer (horisontal, snap til heltall) og
   * kant-drag (endre varighet). Kalles ved slipp/tastaturflytt.
   */
  onFlytt?: (flytt: { id: string; baneId: string | null; fra: number; til: number }) => void;
  /** Baner: <Tidslinje.Bane>. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TidslinjeBaneProps {
  /** Stabil id — påkrevd for drag på tvers av baner. */
  id?: string;
  /** Rad-etikett (spiller/gruppe/ressurs) — vises i venstre kolonne. */
  etikett?: React.ReactNode;
  /** Barer og punkter. */
  children?: React.ReactNode;
}

export interface TidslinjeBarProps {
  /** Stabil id — påkrevd for at baren skal være flyttbar. */
  id?: string;
  /** Start/slutt i enheter (fra inklusiv, til eksklusiv). */
  fra: number;
  til: number;
  /** Pyramide-akse — venstrekant + soft bakgrunn. */
  akse?: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** Dempet variant (forslag/utkast) — stiplet kant. */
  utkast?: boolean;
  onClick?: () => void;
  /** Innhold — tekst/chips. Baren eier ikke innholdsdesignet. */
  children?: React.ReactNode;
}

export interface TidslinjePunktProps {
  /** Posisjon i enheter. */
  ved: number;
  /** Punktfarge-variant: "turnering" (default, TURN-akse) eller "peak" (lime — maks én per visning). */
  variant?: "turnering" | "peak";
  etikett?: string;
  onClick?: () => void;
}

/**
 * Tidslinje — horisontale baner (Notion-Timeline-mønsteret): én rad per
 * spiller/gruppe/ressurs, barer for perioder, punkter for hendelser.
 * DnD: barer dras horisontalt (snap til enhet) og mellom baner; kantene
 * dras for å endre varighet; Alt+piltaster på tastatur; Escape avbryter.
 * Generaliserer Periodeplan (som består som ferdig-komponert spesialtilfelle).
 */
export declare function Tidslinje(props: TidslinjeProps): JSX.Element;
export declare namespace Tidslinje {
  function Bane(props: TidslinjeBaneProps): JSX.Element;
  function Bar(props: TidslinjeBarProps): JSX.Element;
  function Punkt(props: TidslinjePunktProps): JSX.Element;
}
