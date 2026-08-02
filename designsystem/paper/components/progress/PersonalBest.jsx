import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-pb", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pb{font-family:var(--ui)}
.akhq-pb-val{font-family:var(--mono);font-size:32px;font-weight:600;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;color:var(--up)}
.akhq-pb-unit{font-size:13px;color:var(--muted);font-family:var(--mono);font-weight:400}
.akhq-pb-date{font-size:11.5px;color:var(--muted);margin-top:var(--s2)}
}
`);
export function PersonalBest({ label = "Pers", value, unit, date, context, state = "content", emptyText = "F\u00f8rste pers settes p\u00e5 neste m\u00e5ling.", dataOdId = "kpi-personal-best", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={70}>
      <div className="akhq-pb" data-od-id={dataOdId} {...rest}>
        <div className="akhq-lab" style={{ marginBottom: 8 }}>{label}</div>
        <span className="akhq-pb-val">{value}</span>
        {unit && <span className="akhq-pb-unit"> {unit}</span>}
        {(date || context) && <div className="akhq-pb-date">{date}{date && context ? " \u00b7 " : ""}{context}</div>}
      </div>
    </Region>
  );
}
