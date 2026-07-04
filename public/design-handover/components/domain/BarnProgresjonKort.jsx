import React from "react";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — BarnProgresjonKort
 * Foreldreportal: barnets progresjon i KLARSPRÅK, lesevisning. Ingen fagkoder,
 * ingen ID-er, ingen overstyr. Ett budskap + noen få områder m/ trend.
 */
const CSS = `
.ak-bpk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;display:flex;flex-direction:column;gap:14px;}
.ak-bpk__head{display:flex;align-items:center;gap:12px;}
.ak-bpk__av{width:42px;height:42px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-mono);font-weight:700;font-size:14px;background:var(--surface-2);color:var(--text-2);border:1px solid var(--border);}
.ak-bpk__sum{font-family:var(--font-ui);font-size:var(--text-13);line-height:1.55;color:var(--text-2);margin:0;}
.ak-bpk__rad{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--border);}
.ak-bpk__omr{font-family:var(--font-ui);font-size:var(--text-13);color:var(--text);}
.ak-bpk__hoyre{display:flex;align-items:center;gap:9px;}
.ak-bpk__verdi{font-family:var(--font-mono);font-size:var(--text-12);color:var(--text-2);font-variant-numeric:tabular-nums;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-bpk-css")) {
  const s = document.createElement("style"); s.id = "ak-bpk-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function BarnProgresjonKort({ navn, initialer, oppsummering, omrader = [], loading = false, className = "", style }) {
  if (loading) return <Skeleton variant="card" width="100%" height={190} className={className} style={style} />;
  const ini = initialer || (navn ? navn.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?");
  return (
    <div className={`ak-bpk ${className}`} style={style}>
      <div className="ak-bpk__head">
        <span className="ak-bpk__av">{ini}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-16)", color: "var(--text)" }}>{navn}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", color: "var(--text-muted)", marginTop: 3 }}>Utvikling siste 30 dager</div>
        </div>
      </div>
      {oppsummering && <p className="ak-bpk__sum">{oppsummering}</p>}
      {omrader.length > 0 && (
        <div>
          {omrader.map((o, i) => (
            <div key={i} className="ak-bpk__rad">
              <span className="ak-bpk__omr">{o.omrade}</span>
              <span className="ak-bpk__hoyre">
                {o.verdi != null && <span className="ak-bpk__verdi">{o.verdi}</span>}
                {o.trend != null && <DeltaIndikator verdi={o.trend} size="sm" srLabel={`${o.omrade} trend`} />}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
