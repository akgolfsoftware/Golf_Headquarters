// ============================================================
// WeekView — ported 1:1 from v10 workbench-views.jsx
// 5-day grid (MAN 26 – FRE 30), hours 06–21, axis-coloured events.
//
// W5b: `head`/`days` are optional. Real Prisma data (loadWorkbenchData)
// is passed in via props; absent → v10 demo (WEEK_HEAD/WEEK_DAYS).
// ============================================================
import { Icon } from "./icon";
import {
  PERIOD_BAND,
  WEEK_DAYS,
  WEEK_HEAD,
  type WeekDay,
  type WeekEvent,
} from "./data";

// Hours 6..21 → 16 slots. ROW_H px per hour (16 hrs → grid_h).
const HOURS = Array.from({ length: 16 }, (_, i) => 6 + i); // 6..21
const ROW_H = 48;
const GRID_H = ROW_H * (HOURS.length - 1);

// minutes since 06:00 → top px
const topPx = (h: number, m = 0) => (((h - 6) * 60 + m) * ROW_H) / 60;
const heightFor = (mins: number) => (mins * ROW_H) / 60;

type WeekViewProps = {
  head?: { dow: string; date: string; today: boolean; sub: string }[];
  days?: WeekDay[];
};

export function WeekView({ head, days }: WeekViewProps = {}) {
  const weekHead = head ?? WEEK_HEAD;
  const weekDays = days ?? WEEK_DAYS;
  return (
    <section className="cal">
      <div className="cal-week-head">
        <div className="day gutter" />
        {weekHead.map((d) => (
          <div className="day" key={d.dow}>
            <span className="dow">{d.dow}</span>
            <span className={"dt" + (d.today ? " today" : "")}>{d.date}</span>
            {d.sub && <span className="sub">{d.sub}</span>}
          </div>
        ))}
      </div>

      <div className="cal-week-grid" style={{ gridTemplateRows: `auto ${GRID_H}px` }}>
        <div className="period-band">
          <span className="eb">{PERIOD_BAND.eb}</span>
          <span className="name">{PERIOD_BAND.name}</span>
          <span className="focus">
            {PERIOD_BAND.focusLabel}{" "}
            <strong style={{ color: "var(--foreground)" }}>{PERIOD_BAND.focusValue}</strong>
          </span>
        </div>

        {/* Time gutter */}
        <div className="cal-time-col">
          {HOURS.map((h, i) => (
            <div className="h" key={h} style={{ top: `${i * ROW_H}px` }}>
              <span className="t">{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => (
          <DayCol key={day.dow} today={day.today}>
            {day.nowLine && <NowLine top={topPx(day.nowLine.h, day.nowLine.m)} />}
            {day.events.map((ev, i) => (
              <EventBlock key={i} ev={ev} />
            ))}
          </DayCol>
        ))}
      </div>
    </section>
  );
}

// Day column shell
function DayCol({ children, today }: { children: React.ReactNode; today?: boolean }) {
  return (
    <div
      className="cal-day-col"
      style={{ background: today ? "rgba(209,248,67,0.04)" : undefined }}
    >
      {HOURS.slice(1).map((_, i) => (
        <div className="hline" key={i} style={{ top: `${(i + 1) * ROW_H}px` }} />
      ))}
      {children}
    </div>
  );
}

// Event block
function EventBlock({ ev }: { ev: WeekEvent }) {
  const cls = ["event", ev.ax];
  if (ev.selected) cls.push("is-selected");
  if (ev.group) cls.push("group");
  if (ev.tournament) cls.push("tournament");
  return (
    <div
      className={cls.join(" ")}
      style={{ top: `${topPx(ev.h, ev.m ?? 0)}px`, height: `${heightFor(ev.durMin)}px` }}
    >
      <span className="eb">
        <span className={"ax " + ev.ax} />
        {ev.eb}
      </span>
      <div className="ttl">{ev.ttl}</div>
      <div className="meta">
        {ev.meta.map(([ic, tx], i) => (
          <span key={i}>
            <Icon n={ic} w={10} h={10} /> {tx}
          </span>
        ))}
      </div>
      {ev.chips && ev.chips.length > 0 && (
        <div className="chips">
          {ev.chips.map(([nm, c], i) => (
            <span key={i} className={"gchip " + c}>
              {nm}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NowLine({ top }: { top: number }) {
  return <div className="now-line" style={{ top: `${top}px` }} />;
}
