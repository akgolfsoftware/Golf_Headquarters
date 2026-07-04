import * as React from "react";

export interface KanbanKolonneProps {
  /** Kolonnetittel, f.eks. "Utkast". */
  tittel: string;
  /** Status-tone for prikk og teller: "noytral" (utkast/kø) · "aktiv" (signal) · "ferdig". */
  tone?: "noytral" | "aktiv" | "ferdig";
  /** Overstyr antallet i telleren (ellers telles children automatisk). */
  antall?: number;
  /** Kort som children; bruk <KanbanKolonne.Tom> når kolonnen er tom. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface KanbanTomProps {
  /** Tom-tilstandstekst, f.eks. "Ingen planer". */
  children?: React.ReactNode;
}

/**
 * Kanban-kolonne — statuskolonne for planer, oppgaver og køer.
 * Header med status-prikk + teller; kort stables som children med scroll.
 * Legg kolonner side om side i en flex-rad med gap.
 */
export declare function KanbanKolonne(props: KanbanKolonneProps): JSX.Element;
export declare namespace KanbanKolonne {
  function Tom(props: KanbanTomProps): JSX.Element;
}
