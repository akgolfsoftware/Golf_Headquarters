import React from "react";
import { sg as sgf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-sgbar", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-sgbar{display:grid;grid-template-columns:64px minmax(0,1fr) 56px;gap:var(--s3);align-items:center;font-family:var(--ui);padding:5px 0}
.akhq-sgbar-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.akhq-sgbar-track{position:relative;height:10px}
.akhq-sgbar-zero{position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--border)}
.akhq-sgbar-fill{position:absolute;top:1px;bottom:1px;border-radius:2px}
.akhq-sgbar-fill.up{background:var(--up-raw);left:50%}
.akhq-sgbar-fill.dn{background:var(--dn);opacity:.35;right:50%}
.akhq-sgbar-val{font-family:var(--mono);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;text-align:right}
.akhq-sgbar-val.up{color:var(--up)}.akhq-sgbar-val.dn{color:var(--dn)}
}
`);
export function SgBar({ label, value = 0, benchmark = 0, max = 2, dataOdId = "kpi-sg-bar", ...rest }) {
  const diff = value - benchmark;
  const w = Math.min(50, Math.abs(diff) / max * 50);
  return (
    <div className="akhq-sgbar" data-od-id={dataOdId} {...rest}>
      <span className="akhq-sgbar-lab">{label}</span>
      <div className="akhq-sgbar-track">
        <span className="akhq-sgbar-zero"></span>
        <span className={"akhq-sgbar-fill " + (diff >= 0 ? "up" : "dn")} style={{ width: w + "%" }}></span>
      </div>
      <span className={"akhq-sgbar-val " + (diff >= 0 ? "up" : "dn")}>{sgf(value)}</span>
    </div>
  );
}
export function SgBreakdown({ items = [], total, window: win, benchmarkLabel = "benchmark 0,00", max = 2, state = "content", emptyText = "SG beregnes n\u00e5r hull-for-hull-data er registrert.", dataOdId = "panel-sg-breakdown", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={130}>
      <div data-od-id={dataOdId} style={{ fontFamily: "var(--ui)" }} {...rest}>
        {(total !== undefined || win) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            {total !== undefined && <span className="akhq-val" style={{ fontSize: 18, fontWeight: 600, color: total >= 0 ? "var(--up)" : "var(--dn)" }}>{sgf(total)} <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>SG total</span></span>}
            {win && <span style={{ fontSize: 11, color: "var(--muted)" }}>{win}</span>}
          </div>
        )}
        {items.map((it, i) => <SgBar key={i} label={it.label} value={it.value} benchmark={it.benchmark ?? 0} max={max} dataOdId={"kpi-sg-" + (it.label || i)} />)}
        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", textAlign: "center", marginTop: 4 }}>{benchmarkLabel}</div>
      </div>
    </Region>
  );
}
