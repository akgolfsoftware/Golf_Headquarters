// ============================================================
// DirB Tidslinje — ported 1:1 from v10 workbench-dir-b.jsx
// (DirBPyramideStrip, DirBDay, DirBRow, DirBTidslinjeBody).
// Vertical day-by-day agenda: sticky pyramide-strip (5 segments +
// SG-row + Ubalanse/Balansér actions) · tournament strip · day
// sections with session rows (grip · time · axis-dot · title +
// meta/pills · duration · chevron).
//
// W5b: `days` is optional. Real Prisma day-sections render via props;
// absent → v10 demo (DIRB_DAYS). The pyramide-strip (SG-based) and the
// tournament strip have no schema source → kept v10 demo.
// ============================================================
import { Icon } from "./icon";
import {
  DIRB_DAYS,
  DIRB_PYR_SEG,
  DIRB_PYR_SGS,
  DIRB_TOUR_STRIP,
  type DirBDayData,
  type DirBRowData,
} from "./data";

// ───────── Pyramide strip (anchor) ─────────
export function DirBPyramideStrip() {
  return (
    <div className="wbb-pyr">
      <div className="lbl">
        UKE 22 · PYRAMIDE
        <span className="v">12,5 t planlagt</span>
      </div>
      <div className="strip">
        {DIRB_PYR_SEG.map((s) => (
          <div key={s.k} className={"seg " + s.k} style={{ width: s.w + "%" }}>
            {s.lbl}
          </div>
        ))}
      </div>
      <div className="actions">
        <button type="button" className="pyract">
          <Icon n="alert-triangle" />
          Ubalanse
        </button>
        <button type="button" className="pyract pri">
          <Icon n="wand-2" />
          Balansér
        </button>
      </div>
      <div className="sgs">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--muted-foreground)",
          }}
        >
          SG · 30 D
        </span>
        {DIRB_PYR_SGS.map((s) => (
          <span key={s.k} className="ax-sg">
            <span className={"d " + s.k} />
            <span className="ax-nm">{s.nm}</span>
            <span className={"sg-v " + s.cls}>{s.v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ───────── Day section ─────────
function DirBDay({ day }: { day: DirBDayData }) {
  return (
    <div className="wbb-day">
      <div className={"wbb-day-head" + (day.isToday ? " is-today" : "")}>
        <span className="dot" />
        <div className="dt">
          <span className="dow">{day.dow}</span>
          <span className="ddd">{day.dt}</span>
          <span className="mn">{day.mn}</span>
          {day.tag && <span className={"tag" + (day.tagCls ? " " + day.tagCls : "")}>{day.tag}</span>}
        </div>
        <div className="rule" />
        <div className="summary">
          <span className="k">{day.summary.ct}</span> økter · <span className="k">{day.summary.dur}</span>
        </div>
      </div>
      <div className="wbb-rows">
        {day.rows.map((row, i) => (
          <DirBRow key={i} row={row} />
        ))}
      </div>
    </div>
  );
}

function DirBRow({ row }: { row: DirBRowData }) {
  return (
    <div className={"wbb-row" + (row.selected ? " is-selected" : "")} tabIndex={0}>
      <Icon n="grip-vertical" w={12} h={12} />
      <span className="time">{row.time}</span>
      <span className={"ax-dot " + row.ax} />
      <span className="nm">
        <span className="axt">{row.axt}</span>
        <span>{row.ttl}</span>
        {row.meta && (
          <span className="nm-meta">
            {row.meta.map((m, i) => (
              <span key={i}>
                {m[0] && <Icon n={m[0]} w={10} h={10} />}
                {m[1]}
              </span>
            ))}
          </span>
        )}
        {row.pills && (
          <span className="nm-meta" style={{ gap: "4px" }}>
            {row.pills.map(([nm, cls], i) => (
              <span key={i} className={"wbb-pill " + (cls || "")}>
                {nm}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="dur">{row.dur}</span>
      <Icon n="chevron-right" w={14} h={14} />
    </div>
  );
}

// ───────── Tidslinje body (vertical agenda) ─────────
export function DirBTidslinjeBody({ days }: { days?: DirBDayData[] } = {}) {
  const dayList = days ?? DIRB_DAYS;
  return (
    <>
      <DirBPyramideStrip />

      {/* Tournament strip — only weeks with tournaments */}
      <div className="wbb-tour-strip">
        <Icon n="flag" />
        <span className="eb">{DIRB_TOUR_STRIP.eb}</span>
        <span className="nm">{DIRB_TOUR_STRIP.nm}</span>
        <span className="meta">{DIRB_TOUR_STRIP.meta}</span>
      </div>

      {dayList.map((day, i) => (
        <DirBDay key={i} day={day} />
      ))}

      {/* Spacer */}
      <div style={{ height: 32 }} />
    </>
  );
}
