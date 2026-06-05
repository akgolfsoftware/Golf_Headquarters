// ============================================================
// DirBTopbar — ported 1:1 from v10 workbench-dir-b.jsx (DirBTopbar).
// Direction B (Liste) chrome: minimal left (logo + crumb + player
// chip), centered omni-bar, right cluster (VIS-toggle, PLAN A/B,
// mode-icons, Del, + coach bell). The VIS-toggle drives onVis; the
// mode-icons drive onMode. PLAN A/B is presentational (matches v10).
// ============================================================
import { Icon } from "./icon";
import type { Role, Mode } from "./workbench";

type DirBTopbarProps = {
  variant: Role;
  /** which B-mode is active (lights the mode-icon segment) */
  mode: "TIDSLINJE" | "KANBAN" | "DASHBOARD";
  onVis?: (v: "A" | "B") => void;
  onMode?: (m: Mode) => void;
};

export function DirBTopbar({ variant, mode, onVis, onMode }: DirBTopbarProps) {
  return (
    <div className="wbb-top">
      {/* Left — minimal */}
      <div className="grp-l">
        <div className="wbb-mono">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/workbench/logo-mark.svg" alt="AK Golf" />
        </div>
        <div className="wbb-crumb">
          <span>WORKBENCH</span>
          <span className="sep">·</span>
          <span className="cur">PLANLEGGING</span>
        </div>
        <div className="wbb-player-chip">
          <span className="av">ØR</span>
          <span className="nm">Øyvind R.</span>
          <Icon n="chevron-down" w={11} h={11} />
        </div>
      </div>

      {/* Center — omni-bar (Linear-style) */}
      <div className="grp-c">
        <div className="wbb-omni">
          <span className="spk">
            <Icon n="sparkles" w={10} h={10} />
          </span>
          <span className="slash">/</span>
          <input type="text" defaultValue="balansér uke 22 mot innspill" />
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {/* Right */}
      <div className="grp-r">
        <div className="wbb-vis-toggle" role="tablist" aria-label="Visning">
          <button
            type="button"
            className="seg is-active"
            title="Liste-visning (B)"
            onClick={() => onVis?.("B")}
          >
            <Icon n="list" w={11} h={11} />
            Liste
          </button>
          <button
            type="button"
            className="seg"
            title="Kalender-visning (A)"
            onClick={() => onVis?.("A")}
          >
            <Icon n="calendar-days" w={11} h={11} />
            Kalender
          </button>
        </div>
        <div className="wbb-plan">
          <button type="button" className="seg is-active">
            <span className="dot" />A
          </button>
          <button type="button" className="seg">
            <span className="dot" />B
          </button>
        </div>
        <div className="wbb-mode">
          <button
            type="button"
            className={"m" + (mode === "TIDSLINJE" ? " is-on" : "")}
            title="Tidslinje (liste)"
            onClick={() => onMode?.("TIDSLINJE")}
          >
            <Icon n="list" />
          </button>
          <button
            type="button"
            className={"m" + (mode === "KANBAN" ? " is-on" : "")}
            title="Kanban"
            onClick={() => onMode?.("KANBAN")}
          >
            <Icon n="columns-3" />
          </button>
          <button
            type="button"
            className={"m" + (mode === "DASHBOARD" ? " is-on" : "")}
            title="Dashboard"
            onClick={() => onMode?.("DASHBOARD")}
          >
            <Icon n="layout-grid" />
          </button>
        </div>
        <button type="button" className="wbb-share">
          <Icon n="share-2" />
          Del
        </button>
        {variant === "coach" && (
          <button type="button" className="wbb-share" style={{ position: "relative" }}>
            <Icon n="bell" />
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 14,
                height: 14,
                padding: "0 4px",
                background: "var(--destructive)",
                color: "var(--pure-white)",
                borderRadius: 9999,
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--card)",
              }}
            >
              3
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
