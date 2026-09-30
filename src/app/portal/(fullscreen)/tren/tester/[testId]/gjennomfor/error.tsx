"use client";

import Link from "next/link";
import { CircleAlert, RotateCw } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

/** PH-15 feil: testen kunne ikke startes (nattflate). */
export default function Feil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="pa-root" data-theme="night" data-design="precision-athletics" data-screen="PH-15"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <FeilTilstand icon={CircleAlert} title="Testen kunne ikke startes"
          text="Protokollen kunne ikke lastes. Registrerte slag er lagret på telefonen." code="FRAKOBLET · TEST"
          retry={<>
            <Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>
            <Link href="/portal/tren/tester" className="pa-btn pa-btn--ghost">Til testene</Link>
          </>} />
      </div>
    </div>
  );
}
