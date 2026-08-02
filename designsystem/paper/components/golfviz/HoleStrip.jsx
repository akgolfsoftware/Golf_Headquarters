import React from "react";
import { sg as sgf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-holestrip", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-holes{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));font-family:var(--mono);text-align:center}
.akhq-hole{padding:5px 2px;border-left:1px solid var(--border)}
.akhq-hole:first-child,.akhq-hole:nth-child(10){border-left:0}
.akhq-hole-num{font-size:9px;color:var(--muted);margin-bottom:2px}
.akhq-hole-sg{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.akhq-hole-sg.up{color:var(--up)}.akhq-hole-sg.dn{color:var(--dn)}.akhq-hole-sg.flat{color:var(--muted)}
}
`);
export function HoleStrip({ holes = [], window: win, state = "content", emptyText = "Hull-for-hull vises n\u00e5r runden er registrert med SG.", dataOdId = "panel-hole-strip", ...rest }) {
  return (
    <Region state={state} empty={emptyText} height={70}>
      <div data-od-id={dataOdId} style={{ fontFamily: "var(--ui)" }} {...rest}>
        <div className="akhq-holes">
          {holes.map((h, i) => (
            <div className="akhq-hole" key={i}>
              <div className="akhq-hole-num">{h.hole}</div>
              <div className={"akhq-hole-sg " + (h.sg > 0.05 ? "up" : h.sg < -0.05 ? "dn" : "flat")}>{sgf(h.sg, 1)}</div>
            </div>
          ))}
        </div>
        {win && <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 6 }}>{win}</div>}
      </div>
    </Region>
  );
}
