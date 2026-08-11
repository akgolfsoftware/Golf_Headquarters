"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/lib/report-client-error";
import { PaperIkon } from "@/components/system/paper-tilstand";
import "@/styles/paper-system.css";

/**
 * Segment-feilside (500) — Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§500). Egen fil (ikke PaperTilstand) fordi denne
 * trenger en ekte «Last siden på nytt»-knapp koblet til Next sin reset(),
 * ikke bare en lenke.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "segment-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <div className="pks-side" data-paper-slug="system-500">
      <div className="pks-kolonne">
        <div className="pks-merke">
          AK Golf HQ<span>.</span>
        </div>
        <div className="pks-figur" aria-hidden="true">
          {PaperIkon.teknisk}
        </div>
        <h1 className="pks-tittel">Noe feilet hos oss</h1>
        <p className="pks-tekst">
          Dette er ikke din feil, og ingenting du har registrert har gått tapt. Vi har fått beskjed
          automatisk og ser på det.
        </p>
        <div className="pks-virker">
          <span className="pks-flab">Imens</span>
          <div className="pks-linje">
            Registrerte økter<span className="pks-v">lagret</span>
          </div>
          <div className="pks-linje">
            Dagens plan<span className="pks-v">virker</span>
          </div>
        </div>
        <div className="pks-knapper">
          <button type="button" className="pks-btn pks-btn-ink" onClick={reset}>
            Last siden på nytt
          </button>
          <Link className="pks-btn" href="/">
            Til hjem
          </Link>
        </div>
        {error.digest && <p className="pks-kode">500 · hendelse {error.digest}</p>}
      </div>
    </div>
  );
}
