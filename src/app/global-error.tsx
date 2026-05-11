"use client";

// Next.js krever global-error.tsx i app/ for å fange feil i root-layout.
// Også brukes som Sentry-hook for client-side errors.

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="nb">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "#FAFAF7",
            color: "#0A1F17",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#5E5C57",
              }}
            >
              Feil
            </p>
            <h1
              style={{
                marginTop: 12,
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Noe gikk galt
            </h1>
            <p style={{ marginTop: 16, fontSize: 16, color: "#5E5C57" }}>
              Vi har blitt varslet og ser på det. Last inn siden på nytt eller
              gå tilbake til forsiden.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: 24,
                padding: "10px 20px",
                background: "#005840",
                color: "#D1F843",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Tilbake til forsiden
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
