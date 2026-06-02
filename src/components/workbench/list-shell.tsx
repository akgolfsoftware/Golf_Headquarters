// ============================================================
// ListShell — Direction B (Liste) shell, ported 1:1 from v10
// workbench-dir-b.jsx (WorkbenchDirB + WorkbenchDirBWithDrill).
// Composes the B chrome: topbar + 56px rail + agenda body +
// (slide-over only in TIDSLINJE) + bottom bar. The body switches
// on the B-mode:
//   TIDSLINJE → DirBTidslinjeBody (+ slide-over)
//   KANBAN    → DirBKanbanBody
//   DASHBOARD → DirBDashboardBody
//
// Drill-modus (Bolk 4): the slide-over "Åpne drill-modus" CTA / ⌘D
// opens DirBDrillOverlay on top of the B screen (v10's
// WorkbenchDirBWithDrill). State lives here; Esc / backdrop / back /
// close-X dismiss it. Only available in TIDSLINJE (the only mode
// with a slide-over). `initialDrill` lets the preview route land
// with the overlay open for deterministic screenshots.
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { DirBTopbar } from "./dir-b-topbar";
import { DirBRail } from "./dir-b-rail";
import { DirBTidslinjeBody } from "./dir-b-tidslinje";
import { DirBKanbanBody } from "./dir-b-kanban";
import { DirBDashboardBody } from "./dir-b-dashboard";
import { DirBSlideOver } from "./dir-b-slideover";
import { DirBDrillOverlay } from "./dir-b-drill-overlay";
import { DirBBot } from "./dir-b-statusbar";
import type { Role, Mode } from "./workbench";

type ListShellProps = {
  variant: Role;
  /** B-mode (TIDSLINJE default for Liste) */
  mode: "TIDSLINJE" | "KANBAN" | "DASHBOARD";
  onVis?: (v: "A" | "B") => void;
  onMode?: (m: Mode) => void;
  /** Open the drill-overlay on first render (preview ?drill=1). */
  initialDrill?: boolean;
};

export function ListShell({ variant, mode, onVis, onMode, initialDrill = false }: ListShellProps) {
  const isTidslinje = mode === "TIDSLINJE";
  const [drillOpen, setDrillOpen] = useState(initialDrill && isTidslinje);

  // ⌘D toggles the drill-overlay — but only in TIDSLINJE, where the
  // slide-over (and thus the drill-modus CTA) exists. (The overlay's
  // own Esc/⌘D-to-close lives in DirBDrillOverlay while it is open.)
  useEffect(() => {
    if (!isTidslinje) {
      // Leaving TIDSLINJE (e.g. to Kanban) must not strand an open overlay.
      setDrillOpen(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        setDrillOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTidslinje]);

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

        {isTidslinje && <DirBSlideOver onOpenDrill={() => setDrillOpen(true)} />}
      </div>

      <DirBBot mode={mode} onMode={onMode} />

      {isTidslinje && drillOpen && <DirBDrillOverlay onClose={() => setDrillOpen(false)} />}
    </div>
  );
}
