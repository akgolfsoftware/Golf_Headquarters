import React from "react";
import { nf, nfi, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-puttlab", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-putt{font-family:var(--ui)}
.akhq-putt-row{display:grid;grid-template-columns:52px minmax(0,1fr) 92px;gap:var(--s3);align-items:center;padding:4px 0}
.akhq-putt-lab{font-family:var(--mono);font-size:10px;font-weight:600;color:var(--muted)}
.akhq-putt-track{height:8px;background:var(--soft);border-radius:var(--r-pill);overflow:hidden}
.akhq-putt-fill{height:100%;background:var(--info-raw);border-radius:var(--r-pill)}
.akhq-putt-val{font-family:var(--mono);font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--fg)}
.akhq-putt-n{color:var(--muted);font-weight:400}
}
`);
export function PuttLab({ buckets = [], window: win, state = "content", emptyText = "Putt-statistikken fylles n\u00e5r du logger putting-\u00f8kter.", dataOdId = "panel-putt-lab", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={110}>
      <div className="akhq-putt" data-od-id={dataOdId} {...rest}>
        {buckets.map((b, i) => (
          <div className="akhq-putt-row" key={i}>
            <span className="akhq-putt-lab">{b.range}</span>
            <div className="akhq-putt-track"><div className="akhq-putt-fill" style={{ width: Math.min(100, b.pct) + "%" }}></div></div>
            <span className="akhq-putt-val">{nf(b.pct, 0)} % <span className="akhq-putt-n">· {nfi(b.attempts)} forsøk</span></span>
          </div>
        ))}
        {win && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>{win}</div>}
      </div>
    </Region>
  );
}
