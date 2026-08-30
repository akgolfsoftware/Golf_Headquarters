"use client";

/* Fullscreen-feil for /portal/runde/live — ingen V2Shell/rail (chrome-fri
   rute). Danger kun på Feil-etiketten, hvit «Prøv igjen».
   Fasit: designsystem/train-lock/GAP-1 Tilstander.dc.html · RU-01 Runde feil (PX-7). */

import { useEffect } from "react";
import { TL } from "@/lib/v2/train-lock";
import { reportClientError } from "@/lib/report-client-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "portal-runde-live-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: TL.scene, colorScheme: "dark", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <div style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.danger }}>
          Feil
        </div>
        <h1 style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
          Ingen forbindelse
        </h1>
        <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
          Runden lagres lokalt og synkes når nettet er tilbake.
        </p>
        <button
          type="button"
          onClick={reset}
          className="v2-press v2-focus"
          style={{ marginTop: 16, height: 48, width: "100%", borderRadius: 9999, background: TL.text, color: TL.scene, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );
}
