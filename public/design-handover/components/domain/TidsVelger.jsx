import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — TidsVelger
 * Booking-tidvelger: rutenett av tidsluker for én dag med ledig/booket/valgt.
 * 44px trykkmål (WCAG). Booket er ikke-klikkbar (aldri sperre uten forklaring —
 * her er den booket, det ER forklaringen). Farge aldri eneste bærer (tilstand + stil).
 */
const CSS = `
.ak-tv{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;}
.ak-tv__slot{height:44px;border-radius:10px;border:1px solid var(--border);background:var(--surface);
  font-family:var(--font-mono);font-size:var(--text-13);font-weight:600;color:var(--text);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:border-color var(--dur-fast) var(--ease-standard),background var(--dur-fast) var(--ease-standard);}
.ak-tv__slot:hover:not(:disabled){border-color:var(--border-strong);background:var(--surface-hover);}
.ak-tv__slot:focus-visible{outline:none;box-shadow:var(--glow-signal);}
.ak-tv__slot[aria-pressed="true"]{background:var(--signal);color:var(--on-signal);border-color:var(--signal);}
.ak-tv__slot:disabled{color:var(--text-muted);background:var(--surface-2);cursor:not-allowed;
  text-decoration:line-through;text-decoration-color:var(--text-muted);opacity:.7;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-tv-css")) {
  const s = document.createElement("style"); s.id = "ak-tv-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function TidsVelger({ luker = [], valgt, onVelg, loading = false, className = "", style }) {
  if (loading) return <Skeleton variant="card" width="100%" height={110} className={className} style={style} />;
  if (!luker.length) {
    return (
      <div className={className} role="status" style={{ padding: "22px 16px", textAlign: "center", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)", background: "var(--surface)", ...style }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)" }}>Ingen ledige tider denne dagen — velg en annen dag.</span>
      </div>
    );
  }
  return (
    <div className={`ak-tv ${className}`} style={style} role="group" aria-label="Velg tid">
      {luker.map((l) => {
        const booket = l.status === "booket";
        const on = valgt === l.tid;
        return (
          <button key={l.tid} type="button" className="ak-tv__slot" disabled={booket} aria-pressed={on}
            aria-label={`${l.tid}${booket ? " — booket" : on ? " — valgt" : " — ledig"}`}
            onClick={() => !booket && onVelg && onVelg(l.tid)}>
            {l.tid}
          </button>
        );
      })}
    </div>
  );
}
