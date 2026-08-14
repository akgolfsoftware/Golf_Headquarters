"use client";

/* Feil-tilstand for /portal/drills (Paper-port W1, fase2).
   Fasit-copy: banken svarte ikke — drillene i planlagte økter ligger i selve
   økta og virker som før. Dekker også [id]-ruten. */

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
    console.error("[drills/error]", error.digest, error);
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
          Klarte ikke å hente øvelsesbanken
        </h3>
        <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
          Banken svarte ikke innen 30 sekunder. Drillene i planlagte økter ligger i selve økta
          og virker som før.
        </p>
        <button
          type="button"
          onClick={reset}
          data-od-id="drills-retry"
          className="v2-press v2-focus"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 56,
            width: "100%",
            border: `1px solid ${T.borderS}`,
            borderRadius: T.rCard,
            background: T.panel3,
            color: T.fg,
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
