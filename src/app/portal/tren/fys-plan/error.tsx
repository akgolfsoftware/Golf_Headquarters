"use client";

/* Feil-tilstand for /portal/tren/fys-plan (Paper-port W1, fase2).
   Fasit-copy: planlageret svarte ikke — logget trening er trygt lagret. */

import { useEffect } from "react";
import { TL } from "@/lib/v2/train-lock";


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[fys-plan/error]", error.digest, error);
  }, [error]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "24px 16px" }}>
      <div
        style={{
          padding: "24px 16px",
          background: TL.dock,
          border: `1px dashed ${TL.hair}`,
          borderRadius: TL.radius.card,
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
          Klarte ikke å hente FYS-planene
        </h3>
        <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
          Planlageret svarte ikke innen 30 sekunder. Logget trening er trygt lagret.
        </p>
        <button
          type="button"
          onClick={reset}
          data-od-id="fys-retry"
          className="v2-press v2-focus"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 56,
            width: "100%",
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            background: TL.dim,
            color: TL.text,
            fontFamily: TL.font.sans,
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
