/**
 * Lastetilstand for runde-skjermene (pakke 5).
 * Egen fil uten next/link og uten "use client": loading.tsx importerer herfra, og
 * klientkode i importtreet til en loading-grense stoppes av CSP (gotchas §Bygg og drift,
 * vakt: scripts/check-loading-server.mjs).
 */
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";

/** Lastetilstand for runde-skjermene. */
export function RunderLaster({ tekst }: { tekst: string }) {
  return (
    <div className="phn" aria-busy="true" aria-label={tekst}>
      <div className="phr-topp">
        <span className="phn-skjelett" style={{ width: 180, height: 14 }} />
        <span className="phn-skjelett" style={{ width: 200, height: 32 }} />
      </div>
      <div className="phr-grid phr-to">
        <div>
          <span className="phn-skjelett" style={{ height: 200 }} />
          <span className="phn-skjelett" style={{ height: 96 }} />
        </div>
        <div>{[0, 1, 2, 3].map((i) => <span key={i} className="phn-skjelett" style={{ height: 56 }} />)}</div>
      </div>
      <p className="phn-kilde" role="status">{tekst} …</p>
    </div>
  );
}
