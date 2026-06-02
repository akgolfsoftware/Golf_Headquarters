// ============================================================
// WBTopbar — ported 1:1 from v10 workbench-chrome.jsx (variant A)
// ============================================================
import { Icon } from "./icon";
import type { Role, Mode } from "./workbench";

type TopbarProps = {
  role: Role;
  /** which mode-segment chip is lit */
  activeMode: "tidslinje" | "kanban" | "dashboard";
  /** which zoom-segment chip is lit */
  activeZoom: "ÅR" | "MND" | "UKE" | "DAG";
  onVis?: (v: "A" | "B") => void;
  onMode?: (m: Mode) => void;
};

const ZOOMS: ("ÅR" | "MND" | "UKE" | "DAG")[] = ["ÅR", "MND", "UKE", "DAG"];

export function WBTopbar({ role, activeMode, activeZoom, onVis, onMode }: TopbarProps) {
  return (
    <div className="wb-top">
      {/* Left */}
      <div className="grp-l">
        <div className="wb-mono">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/workbench/logo-mark.svg" alt="AK Golf" />
        </div>
        <div className="wb-crumb">
          WORKBENCH · <span className="cur">PLANLEGGING</span> · PRO
        </div>
        <div className="wb-plan-toggle" role="tablist" aria-label="Plan">
          <button type="button" className="seg is-active">
            <span className="dot" />
            PLAN A
          </button>
          <button type="button" className="seg">
            <span className="dot" />
            PLAN B
          </button>
        </div>
        <div className="wb-vis-toggle" role="tablist" aria-label="Visning">
          <button
            type="button"
            className="seg"
            title="Liste-visning (B)"
            onClick={() => onVis?.("B")}
          >
            <Icon n="list" w={11} h={11} />
            Liste
          </button>
          <button
            type="button"
            className="seg is-active"
            title="Kalender-visning (A)"
            onClick={() => onVis?.("A")}
          >
            <Icon n="calendar-days" w={11} h={11} />
            Kalender
          </button>
        </div>
      </div>

      {/* Center — AI Command Bar */}
      <div className="grp-c">
        <div className="wb-ai">
          <div className="input-wrap">
            <span className="spk">
              <Icon n="sparkles" w={12} h={12} />
            </span>
            <input
              type="text"
              placeholder="Flytt mandags SLAG til onsdag og legg til en lett FYS …"
              defaultValue=""
            />
            <span className="kbd">⌘K</span>
          </div>
          <div className="chips">
            <button type="button" className="chip is-on">
              Generér uke
            </button>
            <button type="button" className="chip">
              Balansér
            </button>
            <button type="button" className="chip">
              Foreslå taper
            </button>
            <button type="button" className="chip">
              Fyll standardøkter
            </button>
          </div>
        </div>
      </div>

      {/* Right — depending on role */}
      <div className="grp-r">
        {role === "coach" && (
          <>
            <div className="wb-search">
              <Icon n="search" w={14} h={14} />
              <input type="text" defaultValue="Markus R.P." />
            </div>
            <CoachBell />
          </>
        )}

        <div className="seg-group" role="tablist" aria-label="Zoom">
          {ZOOMS.map((z) => (
            <button
              key={z}
              type="button"
              className={"s" + (activeZoom === z ? " is-on" : "")}
              onClick={() => {
                if (z === "UKE" || z === "DAG") onMode?.(z);
              }}
            >
              {z}
            </button>
          ))}
        </div>

        <div className="seg-group" role="tablist" aria-label="Visningsmodus">
          <button
            type="button"
            className={"s" + (activeMode === "tidslinje" ? " is-on" : "")}
            onClick={() => onMode?.("UKE")}
          >
            <Icon n="calendar-days" /> Tidslinje
          </button>
          <button
            type="button"
            className={"s" + (activeMode === "kanban" ? " is-on" : "")}
            onClick={() => onMode?.("KANBAN")}
          >
            <Icon n="columns-3" /> Kanban
          </button>
          <button
            type="button"
            className={"s" + (activeMode === "dashboard" ? " is-on" : "")}
            onClick={() => onMode?.("DASHBOARD")}
          >
            <Icon n="layout-grid" /> Dashboard
          </button>
        </div>

        <div className="wb-nav-btns">
          <button type="button" className="wb-nav-btn" aria-label="Forrige uke">
            <Icon n="chevron-left" />
          </button>
          <button type="button" className="wb-nav-btn" aria-label="Neste uke">
            <Icon n="chevron-right" />
          </button>
        </div>

        <button type="button" className="wb-btn-ghost">
          <Icon n="share-2" />
          Del plan
        </button>
      </div>
    </div>
  );
}

function CoachBell() {
  return (
    <div style={{ position: "relative" }}>
      <button type="button" className="wb-bell" aria-label="Varsler">
        <Icon n="bell" w={14} h={14} />
        <span className="badge">3</span>
      </button>
    </div>
  );
}
