"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";
import "@/styles/precision-athletics.css";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    reportClientError({
      context: "global-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <html lang="nb">
      <body style={{ margin: 0 }}>
        <div className="pa-root au-ramme" data-design="precision-athletics">
          <div className="au-boks">
            <p className="au-kicker">500</p>
            <h1>Noe feilet hos oss</h1>
            <p>
              Dette er ikke din feil, og ingenting du har registrert har gått tapt. Vi har fått beskjed automatisk og ser på det.
            </p>
            {error.digest ? <p className="au-kodeboks">500 · hendelse {error.digest}</p> : null}
            <Link href="/" className="pa-btn pa-btn--primary">Til hjem</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
