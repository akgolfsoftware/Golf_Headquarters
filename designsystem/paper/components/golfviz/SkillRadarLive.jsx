import React from "react";
import { ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-radar", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-radar-legend{display:flex;gap:var(--s4);font-size:10.5px;color:var(--muted);margin-top:6px;flex-wrap:wrap;font-family:var(--ui)}
.akhq-radar-key{display:inline-flex;align-items:center;gap:5px}
.akhq-radar-swatch{width:14px;height:0;border-top-width:2px;border-top-style:solid;display:inline-block}
}
`);
function poly(vals, axes, c, r) {
  return vals.map((v, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / axes;
    const rr = r * Math.max(0, Math.min(1, v));
    return [c + rr * Math.cos(a), c + rr * Math.sin(a)].map(n => n.toFixed(1)).join(",");
  }).join(" ");
}
export function SkillRadarLive({ axes = [], now = [], target = [], previous = [], size = 190, state = "content", emptyText = "Ferdighetsprofilen tegnes etter f\u00f8rste testbatteri.", dataOdId = "panel-skill-radar", ...rest }) {
  if (state !== "content") return <Region state={state} empty={emptyText} height={size} />;
  const c = size / 2, r = size / 2 - 22, n = axes.length;
  const rings = [0.33, 0.66, 1];
  return (
    <div data-od-id={dataOdId} style={{ fontFamily: "var(--ui)" }} {...rest}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Ferdighetsprofil">
        {rings.map((f, i) => <polygon key={i} points={poly(axes.map(() => f), n, c, r)} fill="none" stroke="var(--border)" />)}
        {axes.map((a, i) => {
          const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
          const lx = c + (r + 13) * Math.cos(ang), ly = c + (r + 13) * Math.sin(ang);
          return <g key={i}>
            <line x1={c} y1={c} x2={c + r * Math.cos(ang)} y2={c + r * Math.sin(ang)} stroke="var(--border)" />
            <text x={lx} y={ly + 3} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--muted)" fontFamily="var(--mono)">{a}</text>
          </g>;
        })}
        {previous.length === n && <polygon points={poly(previous, n, c, r)} fill="none" stroke="var(--mid)" strokeWidth="1.5" strokeDasharray="1.5 3" strokeLinecap="round" />}
        {target.length === n && <polygon points={poly(target, n, c, r)} fill="none" stroke="var(--info-raw)" strokeWidth="1.5" strokeDasharray="5 3" />}
        {now.length === n && <polygon points={poly(now, n, c, r)} fill="var(--fg)" fillOpacity="0.08" stroke="var(--fg)" strokeWidth="1.5" />}
      </svg>
      <div className="akhq-radar-legend">
        <span className="akhq-radar-key"><span className="akhq-radar-swatch" style={{ borderTopColor: "var(--fg)" }}></span>nå</span>
        {target.length > 0 && <span className="akhq-radar-key"><span className="akhq-radar-swatch" style={{ borderTopColor: "var(--info-raw)", borderTopStyle: "dashed" }}></span>mål</span>}
        {previous.length > 0 && <span className="akhq-radar-key"><span className="akhq-radar-swatch" style={{ borderTopColor: "var(--mid)", borderTopStyle: "dotted" }}></span>forrige</span>}
      </div>
    </div>
  );
}
