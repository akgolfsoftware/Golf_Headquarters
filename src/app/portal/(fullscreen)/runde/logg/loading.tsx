import "@/styles/precision-athletics.css";

/** Laster-tilstand for Registrer runde (PH-RD-06). Ingen import fra klientmoduler (CSP-nonce). */
export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics">
      <div className="pa-side">
        <div className="pa-state pa-state--loading" role="status" aria-live="polite">
          <span className="pa-state__mono">Henter baner …</span>
        </div>
      </div>
    </div>
  );
}
