/**
 * Laster- og feiltilstand for pakke 8 Meg i nytt design (PH-24, PH-25, PH-27).
 * Fasit: docs/design-system/utkast-playerhq/meg.html (tilstandene Laster og Feil).
 * Ingen "use client": loading.tsx importerer aldri fra en klientmodul (CSP-nonce, se gotchas §Bygg og drift).
 *
 * Avvik:
 *   - Feiltilstanden har én felles tekst for alle Meg-skjermene; utkastet viser den bare for oversikten.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

export function PH24MegLaster({ tekst = "Henter profilen din …" }: { tekst?: string }) {
  return <div className="phn phn-meg" aria-busy="true" aria-label={tekst}>
    <div className="side">
      <div style={{ display: "grid", gap: 8 }}>
        <span className="phn-skjelett" style={{ width: 120, height: 14 }} />
        <span className="phn-skjelett" style={{ width: 96, height: 32 }} />
      </div>
      <span className="phn-skjelett" style={{ height: 228 }} />
      <div className="ruter">
        {[0, 1, 2, 3].map((i) => <span key={i} className="phn-skjelett" style={{ height: 104 }} />)}
      </div>
      <span className="phn-skjelett" style={{ height: 240 }} />
      <p className="phn-kilde" role="status">{tekst}</p>
    </div>
  </div>;
}

export function PH24MegFeil({ tittel, tekst = "Ingenting er endret. Prøv igjen om litt.", handling }: { tittel: string; tekst?: string; handling?: ReactNode }) {
  return <div className="phn phn-meg">
    <div className="side smal">
      <div className="topp"><div><div className="phn-dato">Meg</div><h1 className="phn-tittel">Meg</h1></div></div>
      <div className="feilboks" role="alert">
        <b>{tittel}</b>
        <p className="phn-forklar">{tekst}</p>
        {handling ?? <Link className="phn-knapp sek" href="/portal/meg">Prøv igjen</Link>}
      </div>
    </div>
  </div>;
}
