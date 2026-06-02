// ============================================================
// ListShell — Direction B (Liste) shell, ported 1:1 from v10
// workbench-dir-b.jsx (WorkbenchDirB). Composes the B chrome:
// topbar + 56px rail + agenda body + (slide-over only in TIDSLINJE)
// + bottom bar. The body switches on the B-mode:
//   TIDSLINJE → DirBTidslinjeBody (+ slide-over)
//   KANBAN    → DirBKanbanBody
//   DASHBOARD → DirBDashboardBody
// ============================================================
import { DirBTopbar } from "./dir-b-topbar";
import { DirBRail } from "./dir-b-rail";
import { DirBTidslinjeBody } from "./dir-b-tidslinje";
import { DirBKanbanBody } from "./dir-b-kanban";
import { DirBDashboardBody } from "./dir-b-dashboard";
import { DirBSlideOver } from "./dir-b-slideover";
import { DirBBot } from "./dir-b-statusbar";
import type { Role, Mode } from "./workbench";

type ListShellProps = {
  variant: Role;
  /** B-mode (TIDSLINJE default for Liste) */
  mode: "TIDSLINJE" | "KANBAN" | "DASHBOARD";
  onVis?: (v: "A" | "B") => void;
  onMode?: (m: Mode) => void;
};

export function ListShell({ variant, mode, onVis, onMode }: ListShellProps) {
  const body =
    mode === "KANBAN" ? (
      <DirBKanbanBody />
    ) : mode === "DASHBOARD" ? (
      <DirBDashboardBody />
    ) : (
      <DirBTidslinjeBody />
    );

  return (
    <div className="wb-b" data-screen-label={`Workbench · B · ${mode}`}>
      <DirBTopbar variant={variant} mode={mode} onVis={onVis} onMode={onMode} />

      <div className="wbb-main">
        <DirBRail />

        <div className={"wbb-agenda" + (mode !== "TIDSLINJE" ? " wbb-no-slide" : "")}>{body}</div>

        {mode === "TIDSLINJE" && <DirBSlideOver />}
      </div>

      <DirBBot mode={mode} onMode={onMode} />
    </div>
  );
}
