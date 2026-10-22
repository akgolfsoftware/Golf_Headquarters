import type { ReactNode } from "react";
import "@/styles/playerhq-ny-live-tittelrad.css";

/**
 * Lys tittelrad for live-skjermene (brief, aktiv, slagteller, oppsummering, test).
 * Erstatter Skrå-toppen med bilde (beslutninger.md §SKRÅ-RESTEN, punkt 2, 22.10.2026):
 * spilleren trenger hele skjermen ute på banen. Raden står fast øverst, så klokke og
 * Avslutt nås uten å rulle.
 */
export function LiveTittelrad({ etikett, overlinje, tittel, ingress, handling }: {
  etikett: string;
  overlinje?: ReactNode;
  tittel: ReactNode;
  ingress?: ReactNode;
  /** Klokke og knapper til høyre (brekker under tittelen på smal skjerm). */
  handling?: ReactNode;
}) {
  return (
    <header className="lv-tittelrad" aria-label={etikett}>
      <div className="lv-tittelrad-tekst">
        {overlinje ? <div className="lv-tittelrad-overlinje">{overlinje}</div> : null}
        <h1 className="lv-tittelrad-tittel">{tittel}</h1>
        {ingress ? <p className="lv-tittelrad-ingress">{ingress}</p> : null}
      </div>
      {handling ? <div className="lv-tittelrad-handling">{handling}</div> : null}
    </header>
  );
}

/** Innholdet under tittelraden, med luft øverst. */
export function LiveInnhold({ children }: { children: ReactNode }) {
  return <div className="lv-innhold">{children}</div>;
}
