import React from "react";
import { nf, ensureCss, Region } from "./viz.jsx";
ensureCss("akhq-css-disp", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-disp{font-family:var(--ui)}
.akhq-disp-cap{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:4px;font-variant-numeric:tabular-nums}
.akhq-disp-hit{display:flex;gap:var(--s3);font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-top:2px;font-variant-numeric:tabular-nums}
.akhq-disp-hit-v{color:var(--fg);font-weight:600}
}
`);
/* K10-utvidelse (03.08.2026): baseline-ellipse (forrige periode/referanse i
   --mid, tegnes BAK dagens) og målsone med hit-rate (sirkel i --up-raw +
   tekstlinje «hit-rate 62 % innenfor 12 m»). Bakoverkompatibel — uten de
   nye propene rendrer kortet som før. */
export function DispersionMap({ points = [], ellipse, baseline, target, hitRate, club, stats, size = 180, state = "content", emptyText = "Dispersion tegnes etter 10 målte slag med TrackMan.", dataOdId = "panel-dispersion", ...rest }) {
  if (state !== "content") return <Region state={state} empty={emptyText} height={size} />;
  const c = size / 2;
  return (
    <div className="akhq-disp" data-od-id={dataOdId} {...rest}>
      {club && <div className="akhq-lab" style={{ marginBottom: 6 }}>{club}</div>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={"Dispersion" + (hitRate ? ". Hit-rate " + hitRate.display : "") + (baseline ? ". Stiplet grå ellipse er " + (baseline.label || "forrige periode") : "")}>
        <rect x="0.5" y="0.5" width={size - 1} height={size - 1} rx="6" fill="none" stroke="var(--border)" />
        <line x1={c} y1="6" x2={c} y2={size - 6} stroke="var(--border)" strokeDasharray="2 3" />
        <line x1="6" y1={c} x2={size - 6} y2={c} stroke="var(--border)" strokeDasharray="2 3" />
        {baseline && <ellipse cx={c + (baseline.cx || 0)} cy={c + (baseline.cy || 0)} rx={baseline.rx} ry={baseline.ry} fill="none" stroke="var(--mid)" strokeDasharray="2 4" strokeWidth="1.5" />}
        {target && <circle cx={c + (target.cx || 0)} cy={c + (target.cy || 0)} r={target.r} fill="var(--up-raw)" fillOpacity="0.08" stroke="var(--up-raw)" strokeDasharray="3 3" strokeWidth="1.5" />}
        {ellipse && <ellipse cx={c + (ellipse.cx || 0)} cy={c + (ellipse.cy || 0)} rx={ellipse.rx} ry={ellipse.ry} fill="var(--info-raw)" fillOpacity="0.10" stroke="var(--info-raw)" strokeDasharray="4 3" strokeWidth="1.5" />}
        {points.map((p, i) => <circle key={i} cx={c + p.x} cy={c + p.y} r="2.5" fill="var(--info-raw)" fillOpacity="0.75" />)}
        <text x={size - 8} y={c - 5} textAnchor="end" fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">H</text>
        <text x="8" y={c - 5} fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">V</text>
        <text x={c + 4} y="12" fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">lang</text>
        <text x={c + 4} y={size - 6} fontSize="8" fill="var(--muted)" fontFamily="var(--mono)">kort</text>
      </svg>
      {stats && <div className="akhq-disp-cap"><span>{stats.side !== undefined && `±${nf(stats.side, 1)} m H/V`}</span><span>{stats.depth !== undefined && `±${nf(stats.depth, 1)} m dybde`}</span><span>{stats.count !== undefined && `${stats.count} slag`}</span></div>}
      {(hitRate || baseline) && (
        <div className="akhq-disp-hit">
          {hitRate && <span>hit-rate <span className="akhq-disp-hit-v">{hitRate.display}</span>{hitRate.zone ? " innenfor " + hitRate.zone : ""}</span>}
          {baseline && <span>stiplet: {baseline.label || "forrige periode"}</span>}
        </div>
      )}
    </div>
  );
}
