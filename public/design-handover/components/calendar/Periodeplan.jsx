import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — Periodeplan
 * Horizontal season timeline: L-phases as colored bands + tournament markers (A/B/C priority).
 * Colors follow the sequential forest→lime phase ramp (--phase-base → --phase-peak).
 * Tournament A = --axis-turn (vermillion), B = --axis-spill (blue), C = --axis-slag (cyan).
 */

const PHASE_TOKEN = {
  Base:           "--phase-base",
  Forberedelse:   "--phase-forberedelse",
  Spesialisering: "--phase-spesialisering",
  Taper:          "--phase-taper",
  Peak:           "--phase-peak",
};
const TOURN_COLOR = {
  A: "--axis-turn",
  B: "--axis-spill",
  C: "--axis-slag",
};

const CSS = `
.ak-pp{display:flex;flex-direction:column;gap:10px;width:100%;}
.ak-pp__band-row{position:relative;width:100%;height:32px;}
.ak-pp__band{
  position:absolute;top:0;height:32px;border-radius:6px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
  cursor:default;
}
.ak-pp__band-lbl{
  font-family:var(--font-mono);font-size:10px;font-weight:700;
  letter-spacing:.07em;text-transform:uppercase;
  color:rgba(0,0,0,0.65);white-space:nowrap;padding:0 8px;
  overflow:hidden;text-overflow:ellipsis;
}
.ak-pp__tourn-row{position:relative;width:100%;height:18px;}
.ak-pp__tourn{
  position:absolute;top:0;height:18px;min-width:18px;
  display:flex;align-items:center;justify-content:center;
  border-radius:4px;
  font-family:var(--font-mono);font-size:10px;font-weight:800;
  color:rgba(0,0,0,0.7);cursor:default;
  transform:translateX(-50%);
}
.ak-pp__axis{
  display:flex;align-items:center;border-top:1px solid var(--border);padding-top:4px;
}
.ak-pp__mo{
  flex:1;font-family:var(--font-mono);font-size:10px;font-weight:500;
  letter-spacing:.03em;color:var(--text-muted);text-align:center;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-pp-css")) {
  const s = document.createElement("style");
  s.id = "ak-pp-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MONTHS_NO = ["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"];

export function Periodeplan({
  phases = [],
  tournaments = [],
  totalWeeks = 52,
  months = MONTHS_NO,
  className = "",
  style,
}) {
  const pct = (w) => `${((w - 1) / totalWeeks) * 100}%`;
  const pctW = (w) => `${(w / totalWeeks) * 100}%`;
  const [hoverBand, setHoverBand] = React.useState(null);
  const [hoverTourn, setHoverTourn] = React.useState(null);

  return (
    <div className={`ak-pp ${className}`} style={style}>
      <div className="ak-pp__band-row">
        {phases.map((p, i) => (
          <div
            key={i}
            className="ak-pp__band"
            style={{
              left: pct(p.startWeek),
              width: pctW(p.durationWeeks),
              background: `var(${PHASE_TOKEN[p.label] || "--phase-base"})`,
            }}
            onMouseEnter={() => setHoverBand(i)}
            onMouseLeave={() => setHoverBand((h) => (h === i ? null : h))}
          >
            <span className="ak-pp__band-lbl">{p.label}</span>
            {hoverBand === i && (
              <DataPreview
                visible
                x="50%"
                y={0}
                placement="top"
                label={p.label}
                value={`${p.durationWeeks} uker`}
                note={`Uke ${p.startWeek}–${p.startWeek + p.durationWeeks - 1}`}
              />
            )}
          </div>
        ))}
      </div>

      {tournaments.length > 0 && (
        <div className="ak-pp__tourn-row">
          {tournaments.map((t, i) => (
            <div
              key={i}
              className="ak-pp__tourn"
              style={{
                left: pct(t.week),
                background: `var(${TOURN_COLOR[t.prio] || "--text-muted"})`,
                padding: "0 5px",
              }}
              onMouseEnter={() => setHoverTourn(i)}
              onMouseLeave={() => setHoverTourn((h) => (h === i ? null : h))}
            >
              {t.prio}
              {hoverTourn === i && (
                <DataPreview
                  visible
                  x="50%"
                  y={0}
                  placement="top"
                  label={`Prioritet ${t.prio}`}
                  value={t.name || `Uke ${t.week}`}
                  note={t.name ? `Uke ${t.week}` : null}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="ak-pp__axis">
        {months.map((m, i) => (
          <span key={i} className="ak-pp__mo">{m}</span>
        ))}
      </div>
    </div>
  );
}
