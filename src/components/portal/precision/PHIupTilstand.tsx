/**
 * Laster og feil for pakke 9 IUP og gameplan (PH-IUP-01, PH-IUP-02, PH-20) i nytt design.
 * Fasit: docs/design-system/utkast-playerhq/iup.html, tilstandene «Laster» og «Feil».
 * Ingen "use client": loading.tsx importerer aldri fra en klientmodul (CSP-nonce, se gotchas §Bygg og drift).
 *
 * Avvik:
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-IUP-01, PH-IUP-02 og PH-20.
 */
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-iup.css";

export function PHIupLaster({ tekst }: { tekst: string }) {
  return <div className="phn phn-iup" aria-busy="true" aria-label={tekst}>
    <div className="smal">
      <div style={{ display: "grid", gap: 8 }}>
        <span className="phn-skjelett" style={{ width: 160, height: 24 }} />
        <span className="phn-skjelett" style={{ width: 240, height: 32 }} />
      </div>
      <span className="phn-skjelett" style={{ height: 8 }} />
      <span className="phn-skjelett" style={{ height: 120 }} />
      <span className="phn-skjelett" style={{ height: 120 }} />
      <span className="phn-skjelett" style={{ height: 120 }} />
      <p className="phn-kilde" role="status">{tekst}</p>
    </div>
  </div>;
}

export function PHIupFeil({ tittel, tekst, kode, onProvIgjen }: { tittel: string; tekst: string; kode?: string; onProvIgjen?: () => void }) {
  return <div className="phn phn-iup">
    <div className="smal">
      <section className="phn-kort" role="alert">
        <h1 className="phn-tittel" style={{ fontSize: 24 }}>{tittel}</h1>
        <p className="phn-forklar">{tekst}</p>
        {kode && <p className="phn-kilde">{kode}</p>}
        {onProvIgjen && <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={onProvIgjen}>Prøv igjen</button></div>}
      </section>
    </div>
  </div>;
}
