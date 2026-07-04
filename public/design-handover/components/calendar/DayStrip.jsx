import React from "react";
import { DataPreview } from "../core/DataPreview.jsx";

/**
 * AK Golf HQ — DayStrip
 * The week day-strip: M T O T F L S with date pills. The selected day is a white
 * pill (dark text); today carries a lime dot; completed days a faint dot.
 * Norwegian week (starts Monday).
 */

const DEFAULT_DAYS = [
  { dow: "M", date: 17 },
  { dow: "T", date: 18 },
  { dow: "O", date: 19 },
  { dow: "T", date: 20 },
  { dow: "F", date: 21 },
  { dow: "L", date: 22 },
  { dow: "S", date: 23 },
];

const CSS = `
.ak-daystrip{display:flex;gap:6px;}
.ak-day{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;
  padding:9px 0 8px;border-radius:var(--radius-pill);border:1px solid transparent;
  background:transparent;cursor:pointer;min-width:38px;position:relative;
  transition:background var(--dur-fast) var(--ease-standard),border-color var(--dur-fast) var(--ease-standard);}
.ak-day:hover{background:var(--surface-hover);}
.ak-day__dow{font-family:var(--font-mono);font-size:10px;font-weight:600;
  letter-spacing:.06em;color:var(--text-muted);line-height:1;}
.ak-day__num{font-family:var(--font-mono);font-size:var(--text-16);font-weight:600;
  color:var(--text);line-height:1;font-variant-numeric:tabular-nums;}
.ak-day__mark{width:5px;height:5px;border-radius:9999px;background:transparent;}
.ak-day--done .ak-day__mark{background:var(--text-muted);}
.ak-day--today .ak-day__mark{background:var(--signal);}
.ak-day--active{background:var(--primary-fill);}
.ak-day--active:hover{background:var(--primary-press);}
.ak-day--active .ak-day__dow{color:color-mix(in srgb,var(--primary-text) 60%,transparent);}
.ak-day--active .ak-day__num{color:var(--primary-text);}
.ak-day--active .ak-day__mark{background:transparent;}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-daystrip-css")) {
  const el = document.createElement("style");
  el.id = "ak-daystrip-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function DayStrip({
  days = DEFAULT_DAYS,
  value,
  onChange,
  className = "",
  style,
}) {
  const activeDate = value != null ? value : days[0] && days[0].date;
  const [hover, setHover] = React.useState(null);
  const DOW = { M: "Mandag", T: "Tirsdag", O: "Onsdag", F: "Fredag", L: "Lørdag", S: "Søndag" };
  return (
    <div className={`ak-daystrip ${className}`} style={style} role="tablist">
      {days.map((d, i) => {
        const isActive = d.date === activeDate;
        const cls = [
          "ak-day",
          isActive ? "ak-day--active" : "",
          d.state === "done" ? "ak-day--done" : "",
          d.today ? "ak-day--today" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cls}
            onClick={() => onChange && onChange(d.date, d)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
          >
            <span className="ak-day__dow">{d.dow}</span>
            <span className="ak-day__num">{d.date}</span>
            <span className="ak-day__mark" />
            {hover === i && (d.okter != null || d.volum != null || d.note != null || d.today) && (
              <DataPreview
                visible
                x="50%"
                y={-4}
                placement="top"
                label={`${DOW[d.dow] || d.dow} ${d.date}`}
                rows={[
                  d.okter != null ? { label: "Økter", value: d.okter } : null,
                  d.volum != null ? { label: "Volum", value: d.volum } : null,
                ].filter(Boolean)}
                value={d.okter == null && d.volum == null ? (d.today ? "I dag" : d.state === "done" ? "Fullført" : "—") : undefined}
                note={d.note}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
