import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — UkeKalender
 * 7-column weekly grid. Each column is one day; sessions inside are colored
 * by axis (FYS/TEK/SLAG/SPILL/TURN) and carry a compliance dot.
 * Mobile: pass compact=true to stack days vertically (falls back on DayStrip+AgendaRow pattern).
 */

const DAYS_NO = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const AXIS_COLOR = {
  FYS:   "--axis-fys",
  TEK:   "--axis-tek",
  SLAG:  "--axis-slag",
  SPILL: "--axis-spill",
  TURN:  "--axis-turn",
};
const AXIS_SOFT = {
  FYS:   "--axis-fys-soft",
  TEK:   "--axis-tek-soft",
  SLAG:  "--axis-slag-soft",
  SPILL: "--axis-spill-soft",
  TURN:  "--axis-turn-soft",
};
const COMP_COLOR = {
  on:      "var(--compliance-on)",
  off:     "var(--compliance-off)",
  none:    "var(--compliance-none)",
  planned: "var(--text-faint)",
};

const CSS = `
.ak-ukek{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;width:100%;}
.ak-ukek__col{display:flex;flex-direction:column;gap:4px;min-width:0;}
.ak-ukek__hd{
  display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:8px 4px 6px;
}
.ak-ukek__dow{
  font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);
}
.ak-ukek__num{
  font-family:var(--font-mono);font-size:var(--text-14);font-weight:600;
  color:var(--text);font-variant-numeric:tabular-nums;
  width:26px;height:26px;border-radius:9999px;
  display:flex;align-items:center;justify-content:center;
}
.ak-ukek__num--today{background:var(--signal);color:var(--on-signal);}
.ak-ukek__body{display:flex;flex-direction:column;gap:3px;flex:1;}
.ak-uks{
  position:relative;overflow:hidden;
  display:flex;flex-direction:column;gap:2px;
  border:1px solid var(--border);
  border-radius:10px;
  padding:7px 8px 7px 12px;cursor:pointer;
  text-align:left;width:100%;background:transparent;
  transition:filter var(--dur-fast) var(--ease-standard);
}
.ak-uks:hover{filter:brightness(1.08);}
.ak-uks__bar{
  position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:0 2px 2px 0;
}
.ak-uks__time{
  font-family:var(--font-mono);font-size:9px;font-weight:600;
  color:var(--text-muted);letter-spacing:.04em;line-height:1;
}
.ak-uks__row{display:flex;align-items:center;gap:4px;}
.ak-uks__dot{width:6px;height:6px;border-radius:9999px;flex-shrink:0;}
.ak-uks__title{
  font-family:var(--font-ui);font-size:var(--text-12);font-weight:500;
  color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  min-width:0;
}
`;

if (typeof document !== "undefined" && !document.getElementById("ak-ukek-css")) {
  const s = document.createElement("style");
  s.id = "ak-ukek-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function SessionCard({ s, onClick }) {
  const axisVar = s.axis ? AXIS_COLOR[s.axis] : null;
  const softVar = s.axis ? AXIS_SOFT[s.axis] : null;
  const compColor = COMP_COLOR[s.compliance || "planned"];
  const [hover, setHover] = React.useState(false);
  const rows = [
    s.axis ? { color: `var(${axisVar})`, label: s.axis, value: s.cs || s.csNivaa || "—" } : null,
    (s.arena != null) ? { label: "Arena", value: s.arena } : null,
    (s.trinn != null) ? { label: "Trinn", value: s.trinn } : null,
  ].filter(Boolean);
  return (
    <button
      type="button"
      className="ak-uks"
      onClick={() => onClick && onClick(s)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: softVar ? `var(${softVar})` : "var(--surface)" }}
    >
      {axisVar && <span className="ak-uks__bar" style={{ background: `var(${axisVar})` }} />}
      {s.time && <span className="ak-uks__time">{s.time}</span>}
      <span className="ak-uks__row">
        <span className="ak-uks__dot" style={{ background: compColor }} />
        <span className="ak-uks__title">{s.title}</span>
      </span>
      {hover && (
        <DataPreview
          visible
          x="50%"
          y={-4}
          placement="top"
          label={s.time ? `${s.title} · ${s.time}` : s.title}
          rows={rows.length ? rows : undefined}
          value={rows.length ? undefined : (s.title || "Økt")}
        />
      )}
    </button>
  );
}

export function UkeKalender({
  week = [],
  onSessionClick,
  className = "",
  style,
}) {
  const days = week.slice(0, 7);
  while (days.length < 7) days.push({ date: null, sessions: [] });

  return (
    <div className={`ak-ukek ${className}`} style={style} role="grid" aria-label="Ukekalender">
      {days.map((day, i) => (
        <div key={i} className="ak-ukek__col" role="gridcell">
          <div className="ak-ukek__hd">
            <span className="ak-ukek__dow">{DAYS_NO[i]}</span>
            <span className={`ak-ukek__num${day.today ? " ak-ukek__num--today" : ""}`}>
              {day.date != null ? day.date : ""}
            </span>
          </div>
          <div className="ak-ukek__body">
            {(day.sessions || []).map((s, j) => (
              <SessionCard key={j} s={s} onClick={onSessionClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
