import React from "react";
import { delta as dfmt, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-airecap", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-recap{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);padding:var(--s4);font-family:var(--ui)}
.akhq-recap.analysis{border-color:var(--info-raw)}
.akhq-recap-prose{font-family:var(--body);font-size:14px;line-height:1.6;color:var(--fg);margin:var(--s2) 0 0;max-width:58ch}
.akhq-recap-deltas{display:flex;gap:var(--s4);flex-wrap:wrap;margin-top:var(--s3)}
.akhq-recap-delta{font-family:var(--mono);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-recap-delta.up{color:var(--up)}.akhq-recap-delta.dn{color:var(--dn)}
.akhq-recap-basis{font-family:var(--ui);font-size:11px;color:var(--muted);font-weight:400;margin-left:4px}
}
`);
export function AiRecap({ who = "Caddie", analysis = true, deltas = [], state = "content", emptyText = "Caddie har ikke nok data enn\u00e5 \u2014 logg minst \u00e9n \u00f8kt.", dataOdId = "panel-ai-recap", children, ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={110}>
      <div className={"akhq-recap" + (analysis ? " analysis" : "")} data-od-id={dataOdId} {...rest}>
        <span className="akhq-lab">{who}</span>
        <p className="akhq-recap-prose">{children}</p>
        {deltas.length > 0 && (
          <div className="akhq-recap-deltas">
            {deltas.map((d, i) => (
              <span className={"akhq-recap-delta " + (d.value >= 0 ? "up" : "dn")} key={i}>
                {dfmt(d.value, d.decimals ?? 1)}{d.unit ? " " + d.unit : ""}
                {d.basis && <span className="akhq-recap-basis">{d.basis}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </Region>
  );
}
