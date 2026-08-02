import React from "react";
import { nf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-trend", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-trend{font-family:var(--ui)}
.akhq-trend-cap{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px}
.akhq-trend-pb{font-family:var(--mono);font-size:10px;font-weight:600;color:var(--up)}
}
`);
export function TrendBand({ data = [], band, pbIndex, unit = "", window: win, width = 280, height = 90, state = "content", emptyText = "Trenden bygges opp \u2014 logg flere runder.", dataOdId = "panel-trend-band", ...rest }) {
  if (state !== "content") return <Region state={state} empty={emptyText} height={height} />;
  const all = [...data, band?.min, band?.max].filter(v => v !== undefined);
  const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
  const y = v => 6 + (1 - (v - min) / span) * (height - 12);
  const x = i => 6 + i / (data.length - 1) * (width - 12);
  const pts = data.map((v, i) => [x(i), y(v)]);
  return (
    <div className="akhq-trend" data-od-id={dataOdId} {...rest}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Utvikling mot benchmark">
        {band && <rect x="0" y={y(band.max)} width={width} height={Math.max(2, y(band.min) - y(band.max))} fill="var(--soft)" rx="2" />}
        <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pbIndex !== undefined && pts[pbIndex] && <g><circle cx={pts[pbIndex][0]} cy={pts[pbIndex][1]} r="3.5" fill="var(--up)" /><text x={pts[pbIndex][0]} y={pts[pbIndex][1] - 7} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--up)" fontFamily="var(--mono)">PB</text></g>}
      </svg>
      <div className="akhq-trend-cap">
        {band && <span>benchmark {nf(band.min, 0)}–{nf(band.max, 0)}{unit ? " " + unit : ""}</span>}
        {win && <span>{win}</span>}
      </div>
    </div>
  );
}
