import React from "react";
import { nf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-pyramid", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-pyr{font-family:var(--ui);display:grid;gap:4px}
.akhq-pyr-row{position:relative;height:26px;border-radius:var(--r-sm);background:var(--soft);overflow:hidden;margin:0 auto;width:100%}
.akhq-pyr-fill{position:absolute;inset:0 auto 0 0;background:var(--fg)}
.akhq-pyr-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 var(--s3);font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em}
.akhq-pyr-name{color:var(--muted);mix-blend-mode:normal}
.akhq-pyr-pct{font-variant-numeric:tabular-nums;color:var(--muted)}
}
`);
const widths = [0.44, 0.58, 0.72, 0.86, 1];
export function PyramidProgress({ levels = [], state = "content", emptyText = "Pyramiden fylles n\u00e5r testbatteriet er gjennomf\u00f8rt.", dataOdId = "panel-pyramid", ...rest }) {
  const n = levels.length || 1;
  return (
    <Region state={state} empty={emptyText} height={150}>
      <div className="akhq-pyr" data-od-id={dataOdId} {...rest}>
        {levels.map((lv, i) => {
          const w = widths[Math.max(0, widths.length - n + i)] ?? 1;
          const pct = Math.max(0, Math.min(100, lv.pct));
          return (
            <div className="akhq-pyr-row" style={{ width: (w * 100) + "%" }} key={i}>
              <div className="akhq-pyr-fill" style={{ width: pct + "%", opacity: 0.12 + 0.10 * pct / 100 }}></div>
              <div className="akhq-pyr-text">
                <span className="akhq-pyr-name" style={{ color: "var(--fg)" }}>{lv.label}</span>
                <span className="akhq-pyr-pct">{nf(pct, 0)} %</span>
              </div>
            </div>
          );
        })}
      </div>
    </Region>
  );
}
