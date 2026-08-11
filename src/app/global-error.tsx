"use client";

// Next.js krever global-error.tsx i app/ for å fange feil i root-layout.
// Egen <html><body> — arver IKKE layout.tsx (fonter/skript), så denne
// bruker samme --p-*-fallback-stack som paper-tokens.css (Poppins/Lora
// laster ikke garantert her). Paper-fasit: system-tilstander.html (§500).

import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";

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
        <div
          data-paper-slug="system-500-global"
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "Poppins, Arial, system-ui, sans-serif",
            background: "#faf9f5",
            color: "#141413",
          }}
        >
          <div style={{ width: "100%", maxWidth: 430, textAlign: "left" }}>
            <div
              aria-hidden="true"
              style={{
                width: 64,
                height: 64,
                marginBottom: 24,
                borderRadius: 16,
                border: "1px solid #e8e6dc",
                background: "#f0eee6",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="#5e5d59" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4l9 16H3z" />
                <path d="M12 10v4M12 17v.5" />
              </svg>
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em" }}>Noe feilet hos oss</h1>
            <p style={{ margin: "0 0 24px", fontFamily: "Georgia, serif", fontSize: 15.5, color: "#5e5d59", lineHeight: 1.5, maxWidth: "46ch" }}>
              Dette er ikke din feil, og ingenting du har registrert har gått tapt. Vi har fått beskjed
              automatisk og ser på det.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                  padding: "0 24px",
                  background: "#141413",
                  color: "#faf9f5",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Til hjem
              </Link>
            </div>
            {error.digest && (
              <p style={{ marginTop: 24, fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#5e5d59" }}>
                500 · hendelse {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
