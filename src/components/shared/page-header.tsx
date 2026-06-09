/**
 * PageHeader — standardisert hero for alle produksjons-pages.
 *
 * Bruker italic Inter Tight via font-display + <em>, matchet
 * mot demo-page-stilen (se /360-demo, /daglig-brief-demo).
 *
 * Eyebrow:    Liten uppercase tekst over tittelen ("AgencyOS · onsdag 14. mai")
 * Title:      Hovedtittel, max 1-2 ord italic (resten regular)
 * Sub:        Sub-tekst under (forklaring eller kontekst)
 * Actions:    Slot for høyrejusterte action-knapper
 */
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  /**
   * Tittel-segment som ikke skal være italic (vises foran italic-delen).
   * Eks: "Velkommen" i "Velkommen *tilbake*"
   */
  titleLead?: string;
  /**
   * Italic-segment av tittelen (vil renderes som italic Inter Tight).
   * Eks: "tilbake" i "Velkommen *tilbake*"
   */
  titleItalic: string;
  /** Tittel-segment etter italic-delen. */
  titleTrail?: string;
  sub?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  titleLead,
  titleItalic,
  titleTrail,
  sub,
  actions,
}: Props) {
  return (
    <header
      role="banner"
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow && (
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            {eyebrow}
          </span>
        )}
        <h1
          className={`${
            eyebrow ? "mt-2" : ""
          } font-display text-3xl font-semibold leading-tight tracking-tight`}
        >
          {titleLead && <>{titleLead} </>}
          <em className="font-normal text-primary md:italic">{titleItalic}</em>
          {titleTrail && <> {titleTrail}</>}
        </h1>
        {sub && (
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
        )}
      </div>
      {actions && (
        <div
          role="group"
          aria-label="Sidehandlinger"
          className="flex items-center gap-2"
        >
          {actions}
        </div>
      )}
    </header>
  );
}
