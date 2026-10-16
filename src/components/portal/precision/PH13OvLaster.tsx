/**
 * Lastetilstand for øvelser og teknikk (pakke 4).
 * Egen fil uten next/link og uten "use client": loading.tsx importerer herfra, og
 * klientkode i importtreet til en loading-grense stoppes av CSP (gotchas §Bygg og drift,
 * vakt: scripts/check-loading-server.mjs).
 */
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";

/** Lastetilstand: skjelett i samme rekkefølge som skjermen, og teksten fra tegningen. */
export function OvLaster({ tekst, dato }: { tekst: string; dato: string }) {
  return (
    <div className="phn" aria-busy="true" style={{ boxSizing: "border-box" }}>
      <div className="phn-ov-topp">
        <span className="phn-dato">{dato}</span>
        <span className="phn-skjelett" style={{ width: 220, height: 32 }} />
      </div>
      <span className="phn-skjelett" style={{ height: 150 }} />
      <span className="phn-skjelett" style={{ height: 96 }} />
      <span className="phn-skjelett" style={{ height: 96 }} />
      <p className="phn-kilde" role="status">{tekst}</p>
    </div>
  );
}
