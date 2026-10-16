/* Ren serverkomponent: loading.tsx importerer aldri fra en "use client"-modul
   (CSP-nonce, gotchas §Bygg og drift) — derfor ikke AgencyOSSkall her. */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)" }}>
      <div className="pa-side">
        <LasterTilstand text="Kobler til pågående økter …" />
      </div>
    </div>
  );
}
