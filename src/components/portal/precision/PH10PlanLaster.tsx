/**
 * Lastetilstand for PH-10 Plan i nytt design. Ingen "use client": loading.tsx
 * importerer aldri fra en klientmodul (CSP-nonce, se gotchas §Bygg og drift).
 */
import "@/styles/playerhq-ny.css";

export function PH10PlanLaster() {
  return <div className="phn" aria-busy="true" aria-label="Henter uka">
    <div className="phn-topp">
      <span className="phn-skjelett" style={{ width: 160, height: 14 }} />
      <span className="phn-skjelett" style={{ width: 96, height: 32 }} />
    </div>
    <span className="phn-skjelett" style={{ height: 160 }} />
    <div className="phn-dager">
      {[0, 1, 2].map((i) => <span key={i} className="phn-skjelett" style={{ height: 120 }} />)}
    </div>
    <p className="phn-kilde" role="status">Henter uka …</p>
  </div>;
}
