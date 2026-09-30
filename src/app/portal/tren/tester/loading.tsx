/* Laster-tilstand for /portal/tren/tester — Precision Athletics PH-14.
   Ren serverkomponent: ingen import fra "use client"-moduler (CSP-nonce, se
   gotchas §Bygg og drift). Derfor ikke PlayerHQSkall; skallet kommer med siden. */

import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics">
      <div className="pa-side" style={{ maxWidth: 1320 }}>
        <LasterTilstand text="Henter testprotokollene …" />
      </div>
    </div>
  );
}
