import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-dots", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-dots{font-family:var(--ui)}
.akhq-dots-row{display:flex;align-items:center;gap:var(--s2);margin-top:var(--s1)}
.akhq-dots-grid{display:flex;gap:3px;flex-wrap:wrap}
.akhq-dot{width:7px;height:7px;border-radius:50%;flex:none}
.akhq-dot.l0{background:var(--soft)}
.akhq-dot.l1{background:var(--mid)}
.akhq-dot.l2{background:var(--fg)}
.akhq-dots-lab{font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;width:32px;flex:none}
.akhq-dots-legend{display:flex;gap:var(--s3);margin-top:var(--s2);font-size:10px;color:var(--muted);align-items:center}
}
`);
export function DotMatrix({ rows = [], legend = ["tom", "lav", "h\u00f8y"], state = "content", emptyText = "Historikken bygger seg opp etter hvert som du logger \u00f8kter.", dataOdId = "panel-dot-matrix", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={90}>
      <div className="akhq-dots" data-od-id={dataOdId} {...rest}>
        {rows.map((r, i) => (
          <div className="akhq-dots-row" key={i}>
            <span className="akhq-dots-lab">{r.label}</span>
            <div className="akhq-dots-grid">{r.values.map((v, j) => <span className={"akhq-dot l" + v} key={j}></span>)}</div>
          </div>
        ))}
        <div className="akhq-dots-legend">
          <span className="akhq-dot l0"></span>{legend[0]}<span className="akhq-dot l1"></span>{legend[1]}<span className="akhq-dot l2"></span>{legend[2]}
        </div>
      </div>
    </Region>
  );
}
