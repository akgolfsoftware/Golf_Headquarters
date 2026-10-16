/**
 * Lastetilstand for TrackMan og tester (pakke 6).
 * Egen fil uten next/link og uten "use client": loading.tsx importerer herfra, og
 * klientkode i importtreet til en loading-grense stoppes av CSP (gotchas §Bygg og drift,
 * vakt: scripts/check-loading-server.mjs).
 */
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";

/** Lastetilstand for TrackMan-skjermene. Ingen "use client": loading.tsx importerer aldri fra en klientmodul. */
export function TmLaster({ tekst }: { tekst: string }) {
  return (
    <div className="phn" aria-busy="true" aria-label={tekst}>
      <div className="phn-topp">
        <span className="phn-skjelett" style={{ width: 180, height: 14 }} />
        <span className="phn-skjelett" style={{ width: 140, height: 32 }} />
        <span className="phn-skjelett" style={{ width: 120, height: 52 }} />
      </div>
      <span className="phn-skjelett" style={{ width: 110, height: 44 }} />
      <div className="phn-to-kol">
        <div className="phn-kol">{[0, 1, 2].map((i) => <span key={i} className="phn-skjelett" style={{ height: 96 }} />)}</div>
        <div className="phn-kol"><span className="phn-skjelett" style={{ height: 240 }} /></div>
      </div>
      <p className="phn-kilde" role="status">{tekst} …</p>
    </div>
  );
}
