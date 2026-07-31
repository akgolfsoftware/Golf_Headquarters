import React from "react";
import { nf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-disp", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-disp{font-family:var(--ui)}
.akhq-disp-cap{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:4px;font-variant-numeric:tabular-nums}
}
`);
export function DispersionMap({ points = [], ellipse, club, stats, size = 180, state = "content", emptyText = "Dispersion tegnes etter 10 m\u00e5lte slag med TrackMan.", dataOdId = "panel-dispersion", ...rest }) {
  if (state !== "content") return <Region state={state} empty={emptyText} height={size} />;
  const c = size / 2;
  return (
    <div className="akhq-disp" data-od-id={dataOdId} {...rest}>
      {club && <div className="akhq-lab" style={{ marginBottom: 6 }}>{club}</div>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Dispersion">
        <rect x="0.5" y="0.5" width={size - 1} height={size - 1} rx="6" fill="none" stroke="var(--border)" />
        <line x1={c} y1="6" x2={c} y2={size - 6} stroke="var(--border)" strokeDasharray="2 3" />
        <line x1="6" y1={c} x2={size - 6} y2={c} stroke="var(--border)" strokeDasharray="2 3" />
        {ellipse && <ellipse cx={c + (ellipse.cx || 0)} cy={c + (ellipse.cy || 0)} rx={ellipse.rx} ry={ellipse.ry} fill="var(--info-raw)" fillOpacity="0.10" stroke="var(--info-raw)" strokeDasharray="4 3" strokeWidth="1.5" />}
        {points.map((p, i) => <circle key={i} cx={c + p.x} cy={c + p.y} r="2.5" fill="var(--info-raw)" fillOpacity="0.75" />)}
        <text x={size - 8} y={c - 5} textAnchor="end" fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">H</text>
        <text x="8" y={c - 5} fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">V</text>
        <text x={c + 4} y="12" fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">lang</text>
        <text x={c + 4} y={size - 6} fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">kort</text>
      </svg>
      {stats && <div className="akhq-disp-cap"><span>{stats.side !== undefined && `\u00b1${nf(stats.side, 1)} m H/V`}</span><span>{stats.depth !== undefined && `\u00b1${nf(stats.depth, 1)} m dybde`}</span><span>{stats.count !== undefined && `${stats.count} slag`}</span></div>}
    </div>
  );
}
