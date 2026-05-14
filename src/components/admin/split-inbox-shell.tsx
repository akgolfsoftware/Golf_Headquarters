"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * SplitInboxShell — gjenbrukbar 3-kolonne split-pane primitive for innbokser.
 *
 * Ansvar:
 *  - Desktop: 3-kolonne grid (liste / detalj / kontekst). Barnekomponentene
 *    blir direkte grid-items via `display: contents`-wrappere, slik at
 *    eksisterende layout med stretch og border-håndtering bevares uendret.
 *  - Mobil: viser kun aktiv pane — liste hvis ingen valgt, ellers detalj
 *    med tilbake-knapp.
 *
 * Forretningslogikk (sortering, filtrering, data-fetching) hører IKKE hjemme her.
 *
 * Eksportert som primitive fra `src/components/admin/`.
 */
export function SplitInboxShell({
  left,
  center,
  right,
  activeKey,
  backHref,
}: {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  activeKey: string | null;
  /** Valgfri href som tilbake-knappen på mobil navigerer til. Default: router.back(). */
  backHref?: string;
}) {
  const router = useRouter();
  const hasActive = activeKey !== null;

  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-card md:[grid-template-columns:300px_1fr_320px]"
      style={{
        height: "calc(100vh - 240px)",
        minHeight: "640px",
      }}
    >
      {/* Venstre: liste — kun synlig på desktop, eller på mobil når ingen aktiv */}
      <div
        className={
          hasActive
            ? "hidden md:contents"
            : "contents"
        }
      >
        {left}
      </div>

      {/* Mobil: tilbake-knapp som dekker hele bredden når detalj er aktiv */}
      {hasActive ? (
        <div className="flex items-center border-b border-border bg-card px-4 py-2 md:hidden">
          <button
            type="button"
            onClick={() => {
              if (backHref) router.push(backHref);
              else router.back();
            }}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake
          </button>
        </div>
      ) : null}

      {/* Midten: detalj — på mobil skjult når ingen valgt */}
      <div
        className={
          hasActive
            ? "contents"
            : "hidden md:contents"
        }
      >
        {center}
      </div>

      {/* Høyre: context-panel — kun på desktop */}
      {right ? <div className="hidden md:contents">{right}</div> : null}
    </div>
  );
}
