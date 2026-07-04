import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — GappingChart
 * Hele baggen: carry per kølle med ±spredning, gap-varsler mellom nabo-køller.
 * Avstander i METER. Spredning som whisker (± carry-spredning). Gap-varsel når
 * avstandshull mellom to køller er for stort/lite.
 */
const CSS = `
.ak-gap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;}
.ak-gap__row{display:grid;grid-template-columns:58px 1fr 66px;align-items:center;gap:10px;padding:5px 0;}
.ak-gap__navn{font-family:var(--font-mono);font-size:var(--text-11);font-weight:700;color:var(--text-2);}
.ak-gap__track{position:relative;height:16px;}
.ak-gap__bar{position:absolute;top:5px;height:6px;border-radius:3px;background:var(--signal);}
.ak-gap__whisk{position:absolute;top:2px;height:12px;border-left:1px solid var(--text-muted);border-right:1px solid var(--text-muted);opacity:.7;}
.ak-gap__val{font-family:var(--font-mono);font-size:var(--text-12);font-weight:700;color:var(--text);text-align:right;font-variant-numeric:tabular-nums;}
.ak-gap__warn{display:flex;align-items:center;gap:7px;margin-top:9px;padding:8px 11px;border-radius:9px;
  background:color-mix(in srgb,var(--down) 12%,transparent);border:1px solid color-mix(in srgb,var(--down) 34%,transparent);
  font-family:var(--font-ui);font-size:var(--text-12);color:var(--text);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-gap-css")) {
  const s = document.createElement("style"); s.id = "ak-gap-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function GappingChart({ koller = [], varsler = [], loading = false, className = "", style }) {
  if (loading) return <Skeleton variant="card" width="100%" height={260} className={className} style={style} />;
  if (!koller.length) {
    return (
      <div className={`ak-gap ${className}`} role="status" style={style}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Køllegapping</span>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-13)", color: "var(--text-2)", lineHeight: 1.5, margin: "10px 0 0" }}>Logg TrackMan-slag for å se carry og gap gjennom baggen.</p>
      </div>
    );
  }
  const max = Math.max(...koller.map((k) => k.carry + (k.spredning || 0))) * 1.05;
  return (
    <div className={`ak-gap ${className}`} style={style} role="img" aria-label="Carry per kølle med spredning">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Køllegapping · carry</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)" }}>meter · ± spredning</span>
      </div>
      {koller.map((k) => {
        const w = (k.carry / max) * 100;
        const sp = ((k.spredning || 0) / max) * 100;
        return (
          <div key={k.navn} className="ak-gap__row">
            <span className="ak-gap__navn">{k.navn}</span>
            <span className="ak-gap__track">
              <span className="ak-gap__bar" style={{ width: `${w}%` }} />
              {k.spredning ? <span className="ak-gap__whisk" style={{ left: `${w - sp}%`, width: `${sp * 2}%` }} /> : null}
            </span>
            <span className="ak-gap__val">{k.carry} m</span>
          </div>
        );
      })}
      {varsler.map((v, i) => (
        <div key={i} className="ak-gap__warn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--down)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {typeof v === "string" ? v : v.tekst}
        </div>
      ))}
    </div>
  );
}
