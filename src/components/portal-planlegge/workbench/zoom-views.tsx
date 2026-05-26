"use client";

/**
 * Zoom-views for Workbench Plan A — År / Måned / Uke / Dag.
 * Forenklede port av plan-zoom-*.jsx — viser hoved-strukturen,
 * detaljer kommer i Sprint 3.
 */

import { WBPIc } from "./icon";
import { usePlanContext } from "./plan-context";
import { WBP_SESSIONS, WBP_WEEKS, type Axis } from "./types";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];

const AXES: Axis[] = ["fys", "tek", "slag", "spill", "turn"];

// ============================================================================
// ÅR — 12 måneder × 5 akser
// ============================================================================

export function WBP_CanvasYear() {
  return (
    <main className="canvas">
      <div className="canvas-head">
        <div className="top-row">
          <h2 className="ttl">
            Sesong 2026 · <em>12 måneder</em>
            <span className="num">5 perioder · 142 økter</span>
          </h2>
          <div className="meta-strip">
            <span>
              Aktiv: <strong>Periode 3 · Bygging</strong>
            </span>
            <span className="sep" />
            <span>
              Neste turnering: <strong>Sørlandsåpent · 21d</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="year-grid">
        <div className="year-months">
          <div className="year-axis-spacer" />
          {MONTHS.map((m, i) => (
            <div
              key={m}
              className={`year-month ${i === 4 ? "year-month-now" : ""}`}
            >
              {m}
            </div>
          ))}
        </div>
        {AXES.map((ax) => (
          <div key={ax} className={`year-row year-row-${ax}`}>
            <div className="year-axis-label">
              <span className={`lane-dot lane-dot-${ax}`} />
              {ax.toUpperCase()}
            </div>
            {MONTHS.map((m, i) => {
              const sessCount = WBP_SESSIONS.filter(
                (s) => s.axis === ax && Math.floor(s.week / 4) === i - 2,
              ).length;
              const intensity =
                sessCount > 3 ? "high" : sessCount > 0 ? "mid" : "none";
              return (
                <div
                  key={`${ax}-${m}`}
                  className={`year-cell year-cell-${intensity}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}

// ============================================================================
// MÅNED — kalender 4-5 uker × 7 dager
// ============================================================================

export function WBP_CanvasMonth() {
  const { setActiveSession } = usePlanContext();
  const DAYS = ["Man", "Tirs", "Ons", "Tors", "Fre", "Lør", "Søn"];

  return (
    <main className="canvas">
      <div className="canvas-head">
        <div className="top-row">
          <h2 className="ttl">
            <em>Mai 2026</em>
            <span className="num">29 økter · 4 uker</span>
          </h2>
          <div className="meta-strip">
            <span>
              Periode 3 · <strong>Bygging mot turnering</strong>
            </span>
            <span className="sep" />
            <span>
              Sørlandsåpent <strong>uke 22</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="month-grid">
        <div className="month-header">
          {DAYS.map((d) => (
            <div key={d} className="month-day-header">
              {d}
            </div>
          ))}
        </div>
        <div className="month-cells">
          {WBP_WEEKS.map((w) =>
            [0, 1, 2, 3, 4, 5, 6].map((d) => {
              const sess = WBP_SESSIONS.filter(
                (s) => s.week === w.id && s.day === d,
              );
              const dayNum = (w.id - 19) * 7 + d + 8; // approx
              return (
                <div
                  key={`${w.id}-${d}`}
                  className={`month-cell ${w.state === "now" && d === 1 ? "month-cell-today" : ""}`}
                >
                  <div className="month-cell-date">
                    {dayNum > 31 ? dayNum - 31 : dayNum}
                  </div>
                  {sess.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`month-pill s-${s.axis}`}
                      onClick={() => setActiveSession(s)}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// UKE — 7 dager × timer
// ============================================================================

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07–20

export function WBP_CanvasWeek() {
  const { setActiveSession } = usePlanContext();
  const DAYS = [
    "Man 22/5",
    "Tirs 23/5",
    "Ons 24/5",
    "Tors 25/5",
    "Fre 26/5",
    "Lør 27/5",
    "Søn 28/5",
  ];
  const weekSess = WBP_SESSIONS.filter((s) => s.week === 21);

  return (
    <main className="canvas">
      <div className="canvas-head">
        <div className="top-row">
          <h2 className="ttl">
            Uke 21 · <em>Bygging</em>
            <span className="num">{weekSess.length} økter</span>
          </h2>
          <div className="meta-strip">
            <span>
              Volum: <strong>6,5t av 10t</strong>
            </span>
            <span className="sep" />
            <span>
              Intensitet: <strong>Høy</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="week-grid">
        <div className="week-header">
          <div className="week-hour-spacer" />
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`week-day-header ${i === 1 ? "week-day-today" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="week-body">
          {HOURS.map((h) => (
            <div key={h} className="week-row">
              <div className="week-hour">{h}:00</div>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const sess = weekSess.find(
                  (s) => s.day === d && h === 14, // approx all at 14:00
                );
                return (
                  <div key={d} className="week-slot">
                    {sess && (
                      <button
                        type="button"
                        className={`week-session s-${sess.axis}`}
                        onClick={() => setActiveSession(sess)}
                      >
                        <div className="week-session-title">{sess.title}</div>
                        <div className="week-session-meta">{sess.meta}</div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// DAG — enkelt-fokus
// ============================================================================

export function WBP_CanvasDay() {
  const { setActiveSession } = usePlanContext();
  const daySess = WBP_SESSIONS.filter((s) => s.week === 21 && s.day === 1);

  return (
    <main className="canvas">
      <div className="canvas-head">
        <div className="top-row">
          <h2 className="ttl">
            Tirs 23/5 · <em>i dag</em>
            <span className="num">{daySess.length} økter</span>
          </h2>
          <div className="meta-strip">
            <span>
              Hovedfokus: <strong>SLAG · Wedge-spinn</strong>
            </span>
            <span className="sep" />
            <span>
              Volum: <strong>3,5t</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="day-focus">
        <div className="day-timeline">
          {daySess.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`day-session-card s-${s.axis}`}
              onClick={() => setActiveSession(s)}
            >
              <div className="day-time">
                <div className="day-time-start">
                  {9 + i * 3}:00
                </div>
                <div className="day-time-dur">90 min</div>
              </div>
              <div className="day-content">
                <div className="day-eyebrow">
                  <span className={`pill pill-${s.axis}`}>
                    <span className="ldot" />
                    {s.axis.toUpperCase()}
                  </span>
                  {s.now && (
                    <span className="pill pill-now">
                      <span className="ldot" />
                      Pågår nå
                    </span>
                  )}
                </div>
                <div className="day-title">{s.title}</div>
                <div className="day-meta">{s.meta}</div>
              </div>
              <WBPIc id="ic-chevright" size={16} />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
