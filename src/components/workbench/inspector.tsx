// ============================================================
// WBInspector — ported 1:1 from v10 workbench-chrome.jsx
// Fixed right column (320px). Coach-variant adds 6 coach actions.
//
// Hodet (eyebrow/tittel/akse+tid) speiler økten som er valgt i uke-
// kalenderen (`selected`-prop fra Workbench-state). Mangler valg →
// v10-demoens standardøkt (ONS · 14:00). Coach-handlingene er flyttet
// til CoachActions (egen client-fil) så de er interaktive.
// ============================================================
import Link from "next/link";
import { Icon } from "./icon";
import type { Role } from "./workbench";
import { INSPECTOR_PERIODE, INSPECTOR_TESTS, type SelectedSession } from "./data";
import { CoachActions } from "./_coach-actions";

type InspectorProps = {
  role: Role;
  /** valgt økt fra uke-kalender. null → demo-standard. */
  selected?: SelectedSession | null;
  /** spiller-id (coach-rute) for kontekst i coach-handlinger. */
  playerId?: string;
  /** spillernavn for handlingsetiketter. */
  playerName?: string;
};

export function WBInspector({ role, selected, playerId, playerName }: InspectorProps) {
  // Standardverdier matcher v10-demoen (ONS · 14:00) når ingen økt er valgt.
  const ttl = selected?.ttl ?? "Innspill 50–80 m · presisjon";
  const ax = selected?.ax ?? "slag";
  const when = selected?.when ?? "Ons 28/5 · 14:00–15:00";
  const axLabel = selected?.axLabel ?? "SLAG";

  return (
    <aside className="insp">
      <div className="insp-head">
        <div className="eb">
          <span>VALGT · ØKT</span>
          <span>UKE 22</span>
        </div>
        <div className="ttl">{ttl}</div>
        <div className="sub">
          <span className={"ax " + ax} />
          {axLabel} · {when}
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
        <Link className="insp-link" href="/admin/tester">
          Alle 8 tester <Icon n="arrow-right" w={12} h={12} />
        </Link>
      </div>

      {/* Coach-handlinger (kun coach) — interaktive via CoachActions */}
      {role === "coach" && (
        <CoachActions
          playerId={playerId}
          playerName={playerName ?? "Øyvind"}
          sessionTitle={ttl}
        />
      )}
    </aside>
  );
}
