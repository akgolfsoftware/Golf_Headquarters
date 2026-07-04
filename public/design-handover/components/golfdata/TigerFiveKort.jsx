import React from "react";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — TigerFiveKort
 * De fem kjernemetrikkene med status og trend — kompakt tilstandsavlesning.
 * Status: farge aldri eneste bærer (ord + prikk). Trend via DeltaIndikator.
 */
const CSS = `
.ak-t5{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow:hidden;}
.ak-t5__row{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;padding:12px 16px;}
.ak-t5__row + .ak-t5__row{border-top:1px solid var(--border);}
.ak-t5__navn{display:flex;align-items:center;gap:9px;font-family:var(--font-ui);font-size:var(--text-13);font-weight:600;color:var(--text);}
.ak-t5__dot{width:8px;height:8px;border-radius:9999px;flex:none;}
.ak-t5__val{font-family:var(--font-mono);font-size:var(--text-14);font-weight:700;color:var(--text);font-variant-numeric:tabular-nums;}
.ak-t5__unit{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);margin-left:3px;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-t5-css")) {
  const s = document.createElement("style"); s.id = "ak-t5-css"; s.textContent = CSS; document.head.appendChild(s);
}
const STATUS = { god: "var(--up)", varsel: "var(--warn, var(--down))", risiko: "var(--down)", noytral: "var(--text-muted)" };

export function TigerFiveKort({ metrikker = [], loading = false, className = "", style }) {
  if (loading) return <Skeleton variant="card" width="100%" height={260} className={className} style={style} />;
  if (!metrikker.length) {
    return (
      <div className={`ak-t5 ${className}`} role="status" style={{ padding: 18, ...style }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Tiger Five</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Fem kjernemetrikker vises når du har logget nok runder.</p>
      </div>
    );
  }
  return (
    <div className={`ak-t5 ${className}`} style={style} role="table" aria-label="Tiger Five">
      {metrikker.map((m) => (
        <div key={m.navn} className="ak-t5__row" role="row">
          <span className="ak-t5__navn"><span className="ak-t5__dot" style={{ background: STATUS[m.status] || STATUS.noytral }} />{m.navn}</span>
          <span className="ak-t5__val">{m.verdi}{m.enhet && <span className="ak-t5__unit">{m.enhet}</span>}</span>
          {m.trend != null ? <DeltaIndikator verdi={m.trend} size="sm" invertert={m.invertert} srLabel={`${m.navn} trend`} /> : <span />}
        </div>
      ))}
    </div>
  );
}
