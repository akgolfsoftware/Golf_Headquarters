"use client";

/* Feil-tilstand for /portal/tren/tester (Paper-port W1, fase2).
   Fasit-copy: resultatlageret svarte ikke — loggede resultater er trygge.
   Ligger på tester-nivået (ikke tren/) så fys-plan ikke arver copy-en.
   Dekker også [testId]-rutene. */

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
    console.error("[tester/error]", error.digest, error);
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
          Klarte ikke å hente testene
        </h3>
        <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
          Resultatlageret svarte ikke innen 30 sekunder. Loggede resultater er trygge — også de
          som alt er sendt til talentprofilen din.
        </p>
        <button
          type="button"
          onClick={reset}
          data-od-id="tester-retry"
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
