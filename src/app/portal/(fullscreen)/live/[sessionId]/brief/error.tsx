"use client";

/** PH-04 feil (Precision Athletics, natt-tema). */
import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, RotateCw } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";
import "@/styles/precision-athletics.css";

export default function BriefError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({ context: "live-brief-error", message: error.message, stack: error.stack, digest: error.digest }).catch(() => {});
  }, [error]);
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)", padding: "12px 16px", boxSizing: "border-box" }}>
    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <FeilTilstand icon={CircleAlert} title="Økta kunne ikke lastes" text="Tilkoblingen ble brutt. Prøv igjen, eller gå tilbake til I dag."
        retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
      <Link href="/portal" className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full" style={{ height: 64 }}>Tilbake til I dag</Link>
    </div>
  </div>;
}
