// ============================================================
// DayView — ported 1:1 from v10 workbench-views.jsx
// Single column, hours 04–22, full drill list per økt.
// The "Start Live Session" CTA renders exactly as v10 (a button).
// Wiring it to /portal/live/{sessionId} is a later integration step
// (see skjerm-manifest a-dag) — out of scope for this visual port.
// ============================================================
import { Icon } from "./icon";
import { DAY_EVENTS, DAY_HEAD, type DayEvent } from "./data";

const HOURS = Array.from({ length: 19 }, (_, i) => 4 + i); // 4..22
const ROW_H = 42;
const GRID_H = ROW_H * (HOURS.length - 1);
const topPx = (h: number, m = 0) => (((h - 4) * 60 + m) * ROW_H) / 60;
const heightFor = (mins: number) => (mins * ROW_H) / 60;

export function DayView() {
  return (
    <section className="cal">
      <div className="cal-week-head" style={{ gridTemplateColumns: "72px 1fr" }}>
        <div className="day gutter" />
        <div
          className="day"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: "12px",
          }}
        >
          <span className="dow">{DAY_HEAD.dow}</span>
          <span className="dt today">{DAY_HEAD.date}</span>
          <span className="sub">{DAY_HEAD.sub}</span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted-foreground)",
              letterSpacing: "0.04em",
            }}
          >
            {DAY_HEAD.summary}
          </span>
        </div>
      </div>

      <div className="day-grid" style={{ gridTemplateRows: `${GRID_H}px` }}>
        {/* Time gutter */}
        <div className="time-col">
          {HOURS.map((h, i) => (
            <div
              key={h}
              style={{
                position: "absolute",
                right: 8,
                top: `${i * ROW_H}px`,
                transform: "translateY(-50%)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--muted-foreground)",
                letterSpacing: "0.04em",
              }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
          {HOURS.map((h, i) => (
            <div
              key={"l" + h}
              style={{
                position: "absolute",
                right: 0,
                top: `${i * ROW_H}px`,
                width: "4px",
                height: "1px",
                background: "var(--border)",
              }}
            />
          ))}
        </div>

        {/* Day column */}
        <div className="day-col" style={{ position: "relative" }}>
          {HOURS.slice(1).map((_, i) => (
            <div
              className="hline"
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${(i + 1) * ROW_H}px`,
                height: "1px",
                background: "var(--border)",
                opacity: 0.4,
              }}
            />
          ))}

          {/* Now line at 11:18 */}
          <NowLine top={topPx(DAY_HEAD.nowLine.h, DAY_HEAD.nowLine.m)} />

          {DAY_EVENTS.map((ev, i) => (
            <DayEventBlock key={i} ev={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DayEventBlock({ ev }: { ev: DayEvent }) {
  return (
    <div
      className={"day-event " + ev.ax}
      style={{ top: `${topPx(ev.h)}px`, height: `${heightFor(ev.durMin)}px` }}
    >
      <span className="eb">
        <span className={"ax " + ev.ax} />
        {ev.eb}
      </span>
      <div className="ttl">{ev.ttl}</div>
      <div className="meta">
        {ev.meta.map(([ic, tx], i) => (
          <span key={i}>
            <Icon n={ic} w={11} h={11} /> {tx}
          </span>
        ))}
      </div>
      {ev.drills.length > 0 && (
        <div className="drill-list">
          {ev.drills.map((d, i) => (
            <div className="drill" key={i}>
              <span className="num">{d.num}</span>
              <span className="nm">
                {d.nm} <span className="sub">{d.sub}</span>
              </span>
              <span className="reps">{d.reps}</span>
              <span className="tm">{d.tm}</span>
            </div>
          ))}
        </div>
      )}
      {ev.cta && (
        <button type="button" className="day-cta">
          <Icon n="play" w={14} h={14} /> Start Live Session
        </button>
      )}
    </div>
  );
}

function NowLine({ top }: { top: number }) {
  return <div className="now-line" style={{ top: `${top}px` }} />;
}
