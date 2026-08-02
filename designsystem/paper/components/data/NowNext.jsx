import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-nownext", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-nn{display:grid;gap:var(--s2);font-family:var(--ui)}
.akhq-nn-now{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);padding:var(--s4)}
.akhq-nn-next{background:var(--soft);border-radius:var(--r);padding:var(--s3) var(--s4)}
.akhq-nn-title{font-size:14px;font-weight:600;color:var(--fg);margin:6px 0 2px}
.akhq-nn-meta{font-size:12px;color:var(--muted)}
.akhq-nn-bar{height:3px;background:var(--soft);border-radius:2px;margin-top:var(--s3);overflow:hidden}
.akhq-nn-fill{height:100%;background:var(--fg);border-radius:2px;transition:width var(--dur) var(--ease)}
.akhq-nn-pct{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
}
`);
export function NowNext({ now, next, state = "content", emptyText = "Ingen \u00f8kt planlagt i dag \u2014 dagen er \u00e5pen.", dataOdId = "panel-now-next", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={110}>
      <div className="akhq-nn" data-od-id={dataOdId} {...rest}>
        {now && (
          <div className="akhq-nn-now">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="akhq-lab">Nå</span>
              {now.progress !== undefined && <span className="akhq-nn-pct">{Math.round(now.progress * 100)} %</span>}
            </div>
            <div className="akhq-nn-title">{now.title}</div>
            {now.meta && <div className="akhq-nn-meta">{now.meta}</div>}
            {now.progress !== undefined && <div className="akhq-nn-bar"><div className="akhq-nn-fill" style={{ width: (now.progress * 100) + "%" }}></div></div>}
          </div>
        )}
        {next && (
          <div className="akhq-nn-next">
            <span className="akhq-lab">Neste</span>
            <div className="akhq-nn-title" style={{ fontSize: 13 }}>{next.title}</div>
            {next.meta && <div className="akhq-nn-meta">{next.meta}</div>}
          </div>
        )}
      </div>
    </Region>
  );
}
