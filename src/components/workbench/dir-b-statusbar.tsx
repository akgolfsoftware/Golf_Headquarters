// ============================================================
// DirBBot — ported 1:1 from v10 workbench-dir-b.jsx (DirBBot).
// Bottom bar / view-tabs: Tidslinje/Kanban/Dashboard tabs (active
// reflects mode, wired to onMode), presentational zoom segments
// (ÅR/MND/UKE/DAG), and the meta cluster (økter, timer, balanse,
// keyboard hints). Zooms match v10 (UKE lit, no handler).
// ============================================================
import { Icon } from "./icon";
import type { Mode } from "./workbench";

type DirBBotProps = {
  mode: "TIDSLINJE" | "KANBAN" | "DASHBOARD";
  onMode?: (m: Mode) => void;
};

const ZOOMS = ["ÅR", "MND", "UKE", "DAG"] as const;

export function DirBBot({ mode, onMode }: DirBBotProps) {
  return (
    <div className="wbb-bot">
      <div className="tabs">
        <button
          type="button"
          className={"tab" + (mode === "TIDSLINJE" ? " is-on" : "")}
          onClick={() => onMode?.("TIDSLINJE")}
        >
          <Icon n="calendar-days" />
          Tidslinje
        </button>
        <button
          type="button"
          className={"tab" + (mode === "KANBAN" ? " is-on" : "")}
          onClick={() => onMode?.("KANBAN")}
        >
          <Icon n="columns-3" />
          Kanban
        </button>
        <button
          type="button"
          className={"tab" + (mode === "DASHBOARD" ? " is-on" : "")}
          onClick={() => onMode?.("DASHBOARD")}
        >
          <Icon n="layout-grid" />
          Dashboard
        </button>
      </div>
      <div className="zooms">
        {ZOOMS.map((z) => (
          <button key={z} type="button" className={"z" + (z === "UKE" ? " is-on" : "")}>
            {z}
          </button>
        ))}
      </div>
      <div className="meta">
        <span>
          <span className="k">4</span> økter
        </span>
        <span>
          <span className="k">12,5 t</span> planlagt
        </span>
        <span>
          Balanse: <span className="warn">−3 pp SPILL</span>
        </span>
        <span className="kbd-hint">
          <span className="k">J</span>
          <span className="k">K</span> bla rader · <span className="k">⌘</span>
          <span className="k">K</span> kommando
        </span>
      </div>
    </div>
  );
}
