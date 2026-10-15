/**
 * Lastetilstand for PH-01 I dag i nytt design. Ingen "use client": loading.tsx
 * importerer aldri fra en klientmodul (CSP-nonce, se gotchas §Bygg og drift).
 */
import "@/styles/playerhq-ny.css";

export function PH01IDagLaster() {
  return <div className="phn" aria-busy="true" aria-label="Henter dagen din">
    <div style={{ display: "grid", gap: 8 }}>
      <span className="phn-skjelett" style={{ width: 220, height: 14 }} />
      <span className="phn-skjelett" style={{ width: 96, height: 32 }} />
    </div>
    <span className="phn-skjelett" style={{ height: 56 }} />
    <span className="phn-skjelett" style={{ height: 196 }} />
    <span className="phn-skjelett" style={{ height: 300 }} />
    <p className="phn-kilde" role="status">Henter dagen din …</p>
  </div>;
}
