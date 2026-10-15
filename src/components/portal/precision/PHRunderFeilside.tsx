"use client";

/**
 * Feilsiden (error.tsx) for runde-skjermene i pakke 5. Lyst tema, også ute på banen.
 * Fasit: docs/design-system/utkast-playerhq/runder.html (tilstand «Feil»).
 * Avvik:
 *   - Ingen egne avvik; teksten følger tegningens feiltekst per skjerm.
 */
import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { reportClientError } from "@/lib/report-client-error";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";

export function PHRunderFeilside({ error, reset, kontekst, tittel, tekst, skall = true }: {
  error: Error & { digest?: string };
  reset: () => void;
  kontekst: string;
  tittel: string;
  tekst: string;
  /** false for fullskjermsrutene (føring ute på banen) uten PlayerHQ-skall. */
  skall?: boolean;
}) {
  useEffect(() => {
    reportClientError({ context: kontekst, message: error.message, stack: error.stack, digest: error.digest }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error, kontekst]);

  const innhold = (
    <div className="phn">
      <section className="phn-kort" role="alert">
        <h1 className="phn-tittel" style={{ fontSize: 22 }}>{tittel}</h1>
        <p className="phn-forklar">{tekst}</p>
        {error.digest && <p className="phn-kilde">Feilkode {error.digest}</p>}
        <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={reset}><RotateCw className="phn-ikon" aria-hidden />Prøv igjen</button></div>
      </section>
    </div>
  );
  if (!skall) return <div className="pa-root" data-design="precision-athletics" data-theme="light">{innhold}</div>;
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{innhold}</PlayerHQSkall>;
}
