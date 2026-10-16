/**
 * Lastetilstand for Meg (pakke 8).
 * Egen fil uten next/link og uten "use client": loading.tsx importerer herfra, og
 * klientkode i importtreet til en loading-grense stoppes av CSP (gotchas §Bygg og drift,
 * vakt: scripts/check-loading-server.mjs).
 */
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
