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
export { PH24MegLaster } from "./PH24MegLaster";


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
