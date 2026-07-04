import React from "react";
import { DeltaIndikator } from "../data/DeltaIndikator.jsx";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — PuttModellKort
 * Innslagsprosent per PUTT-bånd mot Team Norway IUP-baseline. Putting ALLTID i fot (ft).
 * Bånd-rad: avstand → make-% (bar) → vs baseline (DeltaIndikator, prosentpoeng).
 */
const CSS = `
.ak-pmk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;}
.ak-pmk__row{display:grid;grid-template-columns:64px 1fr 54px 64px;align-items:center;gap:10px;padding:6px 0;}
.ak-pmk__band{font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;color:var(--text-2);}
.ak-pmk__track{position:relative;height:14px;border-radius:5px;background:var(--surface-2);overflow:hidden;}
.ak-pmk__fill{position:absolute;top:0;bottom:0;left:0;border-radius:5px;background:var(--signal);transition:width var(--dur-base) var(--ease-standard);}
.ak-pmk__pct{font-family:var(--font-mono);font-size:var(--text-12);font-weight:700;color:var(--text);text-align:right;font-variant-numeric:tabular-nums;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-pmk-css")) {
  const s = document.createElement("style"); s.id = "ak-pmk-css"; s.textContent = CSS; document.head.appendChild(s);
}
const pp = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);

export function PuttModellKort({
  band = [], baseline = "Team Norway IUP", nivaa = "ovet", loading = false, className = "", style,
}) {
  if (loading) return <Skeleton variant="card" width="100%" height={230} className={className} style={style} />;
  if (!band.length) {
    return (
      <div className={`ak-pmk ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Puttemodell</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Logg putter for å se innslagsprosent per avstand mot {baseline}.</p>
      </div>
    );
  }
  return (
    <div className={`ak-pmk ${className}`} style={style} role="img" aria-label={`Innslagsprosent per PUTT-bånd mot ${baseline}`}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Puttemodell · innslag-%</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)" }}>mot {baseline}</span>
      </div>
      {band.map((b) => {
        const d = b.baseline != null ? Math.round(b.pct - b.baseline) : null;
        return (
          <div key={b.band} className="ak-pmk__row">
            <span className="ak-pmk__band">{b.band}</span>
            <span className="ak-pmk__track"><span className="ak-pmk__fill" style={{ width: `${Math.max(0, Math.min(100, b.pct))}%` }} /></span>
            <span className="ak-pmk__pct">{b.pct} %</span>
            {d != null ? <DeltaIndikator verdi={`${pp(d)} pp`} size="sm" srLabel={`${b.band} mot baseline`} /> : <span />}
          </div>
        );
      })}
    </div>
  );
}
