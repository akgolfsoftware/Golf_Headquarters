// ============================================================
// WBStatusbar — ported 1:1 from v10 workbench-chrome.jsx
//
// W5b: `axisHours`/`summary` are optional. Real Prisma data is passed
// via props (week number, session count, planned hours, per-axis
// hours); absent → v10 demo. The balance hint and the pending
// coach-approval count have no schema source → kept as v10 demo.
// ============================================================
import { Icon } from "./icon";
import { STATUSBAR_AXES, type Axis } from "./data";

type WBStatusbarProps = {
  axisHours?: { ax: Axis; lbl: string; hours: number }[];
  summary?: { weekNumber: number; sessionCount: number; plannedHours: number };
};

function fmtH(hours: number): string {
  return (Math.round(hours * 10) / 10).toString().replace(".", ",");
}

export function WBStatusbar({ axisHours, summary }: WBStatusbarProps = {}) {
  const axes = axisHours
    ? axisHours.map((a) => ({ ax: a.ax, lbl: a.lbl, hrs: `${fmtH(a.hours)} t` }))
    : STATUSBAR_AXES;
  const weekKey = summary ? `UKE ${summary.weekNumber}` : "UKE 22";
  const countKey = summary ? String(summary.sessionCount) : "4";
  const hoursKey = summary ? `${fmtH(summary.plannedHours)} t` : "12,5 t";

  return (
    <div className="wb-status">
      <span className="sb-key">{weekKey}</span>
      <span className="sb-sep" />
      <span>
        <span className="sb-key">{countKey}</span> økter
      </span>
      <span className="sb-sep" />
      <span>
        <span className="sb-key">{hoursKey}</span> planlagt
      </span>
      <span className="sb-sep" />
      {axes.map((a) => (
        <span className="ax-pill" key={a.lbl}>
          <span className={"d " + a.ax} />
          {a.lbl} {a.hrs}
        </span>
      ))}
      <span className="sb-sep" />
      <span>
        Balanse: <span className="warn">−3 pp SPILL</span>
      </span>
      <span className="pending">
        <Icon n="alert-circle" w={11} h={11} />3 endringer venter coach-godkjenning
      </span>
    </div>
  );
}
