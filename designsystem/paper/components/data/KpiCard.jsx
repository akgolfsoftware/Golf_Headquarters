import React from "react";
import { nf, delta as dfmt, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-kpi", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-kpi-val{font-family:var(--mono);font-size:clamp(24px,2.4vw,28px);font-weight:600;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;color:var(--fg)}
.akhq-kpi-val.up{color:var(--up)}.akhq-kpi-val.dn{color:var(--dn)}
.akhq-kpi-unit{font-size:12px;color:var(--muted);font-family:var(--mono);margin-left:3px}
.akhq-kpi-meta{margin-top:var(--s2);font-size:12px;color:var(--muted);line-height:1.35}
.akhq-kpi-delta{font-family:var(--mono);font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-kpi-delta.up{color:var(--up)}.akhq-kpi-delta.dn{color:var(--dn)}
}
`);
export function KpiCard({ label, value, unit, window: win, delta, deltaBasis, decimals = 0, tone, state = "content", emptyText = "Ingen m\u00e5linger i vinduet enn\u00e5.", dataOdId = "kpi-card", ...rest }) {
  return (
    <div className="akhq-card" data-od-id={dataOdId} {...rest}>
      <div className="akhq-lab" style={{ marginBottom: 10 }}>{label}</div>
      <Region state={state} empty={emptyText} height={56}>
        <div>
          <span className={"akhq-kpi-val" + (tone ? " " + tone : "")}>{typeof value === "number" ? nf(value, decimals) : value}</span>
          {unit && <span className="akhq-kpi-unit">{unit}</span>}
          <div className="akhq-kpi-meta">
            {delta !== undefined && <span className={"akhq-kpi-delta " + (delta >= 0 ? "up" : "dn")}>{dfmt(delta, decimals ?? 1)}</span>}
            {delta !== undefined && deltaBasis && <span> {deltaBasis}</span>}
            {win && <span>{delta !== undefined ? " \u00b7 " : ""}{win}</span>}
          </div>
        </div>
      </Region>
    </div>
  );
}
