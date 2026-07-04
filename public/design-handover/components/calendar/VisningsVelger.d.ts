import * as React from "react";

export type KalenderVisning = "agenda" | "uke" | "maned" | "tidslinje";

export interface VisningsVelgerProps {
  /** Aktiv visning (kontrollert). */
  visning: KalenderVisning;
  onVisning: (v: KalenderVisning) => void;
  /** Hvilke visninger som tilbys, i rekkefølge. Default alle fire. */
  visninger?: KalenderVisning[];
  /** Periode-etikett, f.eks. "Uke 25 · juni 2026". */
  periode?: React.ReactNode;
  /** Forrige/neste periode. Pilene skjules om utelatt. */
  onForrige?: () => void;
  onNeste?: () => void;
  /** «I dag»-knappen. Skjules om utelatt. */
  onIdag?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Visnings-velger — kalenderens hode: flate tekst-tabs (Agenda · Uke · Måned ·
 * Tidslinje) med aktiv understrek, periode-etikett og forrige/neste/I dag.
 * Kontrollert; eier ingen kalenderdata. Visning + dato bør speiles i URL.
 */
export declare function VisningsVelger(props: VisningsVelgerProps): JSX.Element;
