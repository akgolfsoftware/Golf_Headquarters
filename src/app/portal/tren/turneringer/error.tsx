"use client";

/* Feil-tilstand for /portal/tren/turneringer (Paper-port W1, fase2).
   Fasit-copy: katalogen svarte ikke — påmeldingene står trygt i GolfBox
   uansett; dette gjelder kun visningen her. Dekker også [id]-ruten. */

import { useEffect } from "react";
import { T } from "@/lib/v2/tokens";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[turneringer/error]", error.digest, error);
  }, [error]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "24px 16px" }}>
      <div
        style={{
          padding: "24px 16px",
          background: T.panel2,
          border: `1px dashed ${T.border}`,
          borderRadius: T.rCard,
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
          Klarte ikke å hente turneringene
        </h3>
        <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
          Turneringskatalogen svarte ikke. Påmeldingene dine står trygt i
          GolfBox uansett — dette gjelder bare visningen her.
        </p>
        <button
          type="button"
          onClick={reset}
          data-od-id="turn-retry"
          className="v2-press v2-focus"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 56,
            width: "100%",
            border: "none",
            borderRadius: T.rCard,
            background: T.handling,
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Prøv igjen
        </button>
      </div>
    </main>
  );
}
