"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { reportClientError } from "@/lib/report-client-error";
import "@/styles/playerhq-ny.css";

export default function TrackManError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({ context: "portal-trackman-error", message: error.message, stack: error.stack, digest: error.digest }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="phn">
        <section className="phn-kort" role="alert">
          <h1 className="phn-tittel" style={{ fontSize: 22 }}>Fikk ikke hentet TrackMan</h1>
          <p className="phn-forklar">Slagene dine er trygge. Sjekk nettet og prøv igjen.</p>
          {error.digest && <p className="phn-kilde">Feilkode {error.digest}</p>}
          <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={reset}><RotateCw className="phn-ikon" aria-hidden />Prøv igjen</button></div>
        </section>
      </div>
    </PlayerHQSkall>
  );
}
