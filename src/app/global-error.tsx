"use client";

// Next.js krever global-error.tsx i app/ for å fange feil i root-layout.

import Link from "next/link";

export default function GlobalError() {
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
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-foreground))",
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
            <p style={{ marginTop: 16, fontSize: 16, color: "hsl(var(--muted-foreground))" }}>
              Vi har blitt varslet og ser på det. Last inn siden på nytt eller
              gå tilbake til forsiden.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: 24,
                padding: "10px 20px",
                background: "hsl(var(--primary))",
                color: "hsl(var(--accent))",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Tilbake til forsiden
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
