"use client";

/**
 * Feiltilstand for pakke 4 «Øvelser og teknikk» (PH-12, PH-13, PH-TP-01), brukt av error.tsx.
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html (tilstanden «Feil»).
 * Avvik:
 *   - Ingen egne avvik. Teksten sier hva som ikke kunne hentes, og at ingenting er tapt.
 */
import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { reportClientError } from "@/lib/report-client-error";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";

export function OvFeil({ error, reset, kontekst, tittel, tekst }: {
  error: Error & { digest?: string };
  reset: () => void;
  kontekst: string;
  tittel: string;
  tekst: string;
}) {
  useEffect(() => {
    reportClientError({ context: kontekst, message: error.message, stack: error.stack, digest: error.digest }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error, kontekst]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="phn">
        <section className="phn-kort" role="alert">
          <h1 className="phn-tittel" style={{ fontSize: 22 }}>{tittel}</h1>
          <p className="phn-forklar">{tekst}</p>
          {error.digest && <p className="phn-kilde">Feilkode {error.digest}</p>}
          <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={reset}><RotateCw className="phn-ikon" aria-hidden />Prøv igjen</button></div>
        </section>
      </div>
    </PlayerHQSkall>
  );
}
