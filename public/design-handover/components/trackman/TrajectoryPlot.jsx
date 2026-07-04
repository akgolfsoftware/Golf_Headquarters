import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";
import { TM_SERIER, TmMarkor } from "./DispersionPlot.jsx";

/**
 * AK Golf HQ — TrajectoryPlot
 * Ballbaner (høyde × avstand). Kurvene syntetiseres ballistisk fra carry+apex
 * (toppunkt ved ~55% av carry — matcher rapportens kurveform).
 * Deler serie-språk (farge + form) og legend-filter med DispersionPlot.
 */

const CSS = `
.ak-traj{display:flex;flex-direction:column;gap:12px;width:100%;}
.ak-traj__svg{width:100%;display:block;overflow:visible;}
.ak-traj__sr{
  position:absolute;width:1px;height:1px;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-traj-css")) {
  const s = document.createElement("style");
  s.id = "ak-traj-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const fmt = (v) => String(Math.round(v * 10) / 10).replace(".", ",");

export function TrajectoryPlot({ baner = [], koller, loading = false, hoyde = 220, className = "", style }) {
  const serier = koller || [...new Set(baner.map((b) => b.kolle))].map((id) => ({ id, navn: id }));
  const [av, setAv] = React.useState({});

  if (loading) {
    return <Skeleton variant="card" width="100%" height={hoyde} className={className} style={style} />;
  }
  if (!baner || baner.length === 0) {
    return (
      <div
        className={className}
        role="status"
        style={{
          height: hoyde, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: 16, boxSizing: "border-box",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-card)",
          background: "var(--surface)", textAlign: "center", ...style,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Ingen ballbaner ennå</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>Baner vises når TrackMan-slag er registrert i meter (carry, topphøyde).</span>
      </div>
    );
  }

  const W = 720, H = hoyde, PAD = { t: 14, r: 16, b: 24, l: 30 };
  const maxX = Math.max(60, ...baner.map((b) => b.carry)) * 1.06;
  const maxY = Math.max(15, ...baner.map((b) => b.apex)) * 1.25;
  const sx = (v) => PAD.l + (v / maxX) * (W - PAD.l - PAD.r);
  const sy = (v) => H - PAD.b - (v / maxY) * (H - PAD.t - PAD.b);

  /** Ballistisk kurve: toppunkt ved 55% av carry, brattere fall enn stigning. */
  const bane = (b) => {
    const px = b.carry * 0.55;
    return `M ${sx(0)} ${sy(0)} Q ${sx(px * 0.85)} ${sy(b.apex * 1.28)} ${sx(px)} ${sy(b.apex)} Q ${sx(b.carry * 0.92)} ${sy(b.apex * 0.72)} ${sx(b.carry)} ${sy(0)}`;
  };

  const xstep = maxX > 140 ? 40 : 20;
  const xticks = [];
  for (let d = xstep; d <= maxX; d += xstep) xticks.push(d);
  const ystep = maxY > 30 ? 15 : 5;
  const yticks = [];
  for (let h = ystep; h <= maxY; h += ystep) yticks.push(h);

  const oppsummering = serier
    .map((k) => {
      const bs = baner.filter((b) => b.kolle === k.id);
      if (!bs.length) return null;
      const mc = bs.reduce((a, b) => a + b.carry, 0) / bs.length;
      const ma = bs.reduce((a, b) => a + b.apex, 0) / bs.length;
      return `${k.navn}: ${bs.length} baner, snitt carry ${fmt(mc)} m, snitt topphøyde ${fmt(ma)} m.`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`ak-traj ${className}`} style={style}>
      <div className="ak-disp__legend" role="group" aria-label="Køller — klikk for å filtrere">
        {serier.map((k, i) => {
          const st = TM_SERIER[i % TM_SERIER.length];
          const n = baner.filter((b) => b.kolle === k.id).length;
          return (
            <button
              key={k.id}
              type="button"
              className={`ak-displeg${av[k.id] ? " ak-displeg--off" : ""}`}
              aria-pressed={!av[k.id]}
              onClick={() => setAv((p) => ({ ...p, [k.id]: !p[k.id] }))}
            >
              <svg width="12" height="12" viewBox="-7 -7 14 14" aria-hidden="true">
                <TmMarkor form={st.form} x={0} y={0} r={5} farge={st.farge} />
              </svg>
              <span className="ak-displeg__lbl">{k.navn}</span>
              <span className="ak-displeg__n">{n}</span>
            </button>
          );
        })}
      </div>

      <svg className="ak-traj__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Ballbane-plot. ${oppsummering}`}>
        {yticks.map((h) => (
          <g key={h}>
            <line x1={PAD.l} y1={sy(h)} x2={W - PAD.r} y2={sy(h)} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.l - 6} y={sy(h) + 3} textAnchor="end" fill="var(--text-muted)"
              style={{ font: "600 9px var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{h}</text>
          </g>
        ))}
        {xticks.map((d) => (
          <text key={d} x={sx(d)} y={H - 8} textAnchor="middle" fill="var(--text-muted)"
            style={{ font: "600 9px var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{d}</text>
        ))}
        {/* bakken */}
        <line x1={PAD.l} y1={sy(0)} x2={W - PAD.r} y2={sy(0)} stroke="var(--border-strong)" strokeWidth="1" />

        {serier.map((k, i) =>
          av[k.id] ? null : baner
            .filter((b) => b.kolle === k.id)
            .map((b, j) => (
              <path
                key={`${k.id}-${j}`}
                d={bane(b)}
                fill="none"
                stroke={TM_SERIER[i % TM_SERIER.length].farge}
                strokeWidth="1.2"
                opacity="0.45"
              />
            ))
        )}
      </svg>
      <span className="ak-traj__sr">{oppsummering}</span>
    </div>
  );
}
