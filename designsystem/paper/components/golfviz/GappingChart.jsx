import React from "react";
import { nfi, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-gapping", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-gap{font-family:var(--ui)}
.akhq-gap-row{display:grid;grid-template-columns:52px minmax(0,1fr) 52px;gap:var(--s3);align-items:center;padding:4px 0}
.akhq-gap-lab{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.akhq-gap-track{position:relative;height:14px}
.akhq-gap-range{position:absolute;top:5.5px;height:3px;border-radius:2px;background:var(--info-raw);opacity:.5}
.akhq-gap-avg{position:absolute;top:3px;width:8px;height:8px;border-radius:50%;background:var(--fg);transform:translateX(-50%)}
.akhq-gap-val{font-family:var(--mono);font-size:11.5px;font-weight:600;text-align:right;font-variant-numeric:tabular-nums;color:var(--fg)}
}
`);
export function GappingChart({ clubs = [], min = 40, max = 240, unit = "m", window: win, state = "content", emptyText = "Gapping tegnes n\u00e5r k\u00f8llene er m\u00e5lt p\u00e5 TrackMan.", dataOdId = "panel-gapping", ...rest }) {
  const pct = v => Math.max(0, Math.min(100, (v - min) / (max - min) * 100));
  return (
    <Region state={state} empty={emptyText} height={140}>
      <div className="akhq-gap" data-od-id={dataOdId} {...rest}>
        {clubs.map((cl, i) => (
          <div className="akhq-gap-row" key={i}>
            <span className="akhq-gap-lab">{cl.club}</span>
            <div className="akhq-gap-track">
              <span className="akhq-gap-range" style={{ left: pct(cl.min) + "%", width: (pct(cl.max) - pct(cl.min)) + "%" }}></span>
              <span className="akhq-gap-avg" style={{ left: pct(cl.avg) + "%" }}></span>
            </div>
            <span className="akhq-gap-val">{nfi(cl.avg)} {unit}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", marginTop: 4, paddingLeft: 64, paddingRight: 64 }}><span>{nfi(min)} {unit}</span><span>{nfi(max)} {unit}</span></div>
        {win && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>{win}</div>}
      </div>
    </Region>
  );
}
