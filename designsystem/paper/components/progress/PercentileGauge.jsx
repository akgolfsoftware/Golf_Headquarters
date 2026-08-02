import React from "react";
import { nfi, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-pctile", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pctile{font-family:var(--ui)}
.akhq-pctile-val{font-family:var(--mono);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--fg)}
.akhq-pctile-suffix{font-size:12px;color:var(--muted);font-weight:400}
.akhq-pctile-band{position:relative;height:8px;background:var(--soft);border-radius:var(--r-pill);margin-top:var(--s2)}
.akhq-pctile-marker{position:absolute;top:-3px;width:3px;height:14px;background:var(--fg);border-radius:2px;transform:translateX(-50%)}
.akhq-pctile-scale{display:flex;justify-content:space-between;font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:4px}
.akhq-pctile-cohort{font-size:11px;color:var(--muted);margin-top:6px}
}
`);
export function PercentileGauge({ value = 0, label, cohort, state = "content", emptyText = "Persentilen beregnes n\u00e5r minst 5 runder er logget.", dataOdId = "kpi-percentile", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={80}>
      <div className="akhq-pctile" data-od-id={dataOdId} {...rest}>
        {label && <div className="akhq-lab" style={{ marginBottom: 6 }}>{label}</div>}
        {/* Punktumet er norsk ordenstall («68. persentil»), ikke et desimaltegn.
            Det ligger i suffikset, ikke i hero-tallet: i 22 px mono leste det som
            en formateringsfeil [funn 31.07]. Muted og lite hører det til ordet. */}
        <span className="akhq-pctile-val">{nfi(value)}<span className="akhq-pctile-suffix">. persentil</span></span>
        <div className="akhq-pctile-band"><div className="akhq-pctile-marker" style={{ left: Math.max(0, Math.min(100, value)) + "%" }}></div></div>
        <div className="akhq-pctile-scale"><span>0</span><span>50</span><span>100</span></div>
        {cohort && <div className="akhq-pctile-cohort">{cohort}</div>}
      </div>
    </Region>
  );
}
