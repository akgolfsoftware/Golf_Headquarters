// ============================================================
// WBInspector — ported 1:1 from v10 workbench-chrome.jsx
// Fixed right column (320px). Coach-variant adds 6 coach actions.
// ============================================================
import { Icon } from "./icon";
import type { Role } from "./workbench";
import { INSPECTOR_COACH_ACTIONS, INSPECTOR_PERIODE, INSPECTOR_TESTS } from "./data";

type InspectorProps = {
  role: Role;
};

export function WBInspector({ role }: InspectorProps) {
  return (
    <aside className="insp">
      <div className="insp-head">
        <div className="eb">
          <span>VALGT · ØKT</span>
          <span>UKE 22</span>
        </div>
        <div className="ttl">Innspill 50–80 m · presisjon</div>
        <div className="sub">
          <span className="ax slag" />
          SLAG · Ons 28/5 · 14:00–15:00
        </div>
      </div>

      <div className="insp-sec">
        <div className="insp-kpis">
          <div className="insp-kpi">
            <div className="v">GFGK</div>
            <div className="l">BANE</div>
          </div>
          <div className="insp-kpi">
            <div className="v">4</div>
            <div className="l">DRILLS</div>
          </div>
          <div className="insp-kpi">
            <div className="v" style={{ color: "var(--warning)" }}>
              CS 80
            </div>
            <div className="l">VANSKE</div>
          </div>
        </div>
      </div>

      {/* Periode-pyramide */}
      <div className="insp-sec">
        <div className="sec-lbl">PERIODE-PYRAMIDE · U. 19–24</div>
        <div className="mp">
          {INSPECTOR_PERIODE.map((r) => (
            <div className="mp-row" key={r.l}>
              <span className="l">{r.l}</span>
              <div className="b">
                <div className={"f " + r.ax} style={{ width: r.width }} />
              </div>
              <span className="v">{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tester snarveier */}
      <div className="insp-sec">
        <div className="sec-lbl" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>SNARVEIER · TESTER</span>
          <span style={{ color: "var(--destructive)" }}>3 OVERDUE</span>
        </div>
        <div className="test-grid">
          {INSPECTOR_TESTS.map((t) => (
            <div className="test-card" key={t.tnm}>
              <div className="tlbl">{t.tlbl}</div>
              <div className="tnm">{t.tnm}</div>
              <div className={"tdue" + (t.overdue ? " overdue" : "")}>
                <Icon n={t.dueIcon} w={9} h={9} />
                {t.due}
              </div>
            </div>
          ))}
        </div>
        <a className="insp-link" href="#">
          Alle 8 tester <Icon n="arrow-right" w={12} h={12} />
        </a>
      </div>

      {/* Coach-handlinger */}
      {role === "coach" && (
        <div className="insp-sec">
          <div className="sec-lbl">COACH-HANDLINGER</div>
          <div className="coach-actions">
            {INSPECTOR_COACH_ACTIONS.map((a) => (
              <button type="button" className={"coach-act" + (a.pri ? " pri" : "")} key={a.label}>
                <Icon n={a.icon} w={a.pri ? 14 : 14} h={a.pri ? 14 : 14} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
