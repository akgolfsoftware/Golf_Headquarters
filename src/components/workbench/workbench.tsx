"use client";

// ============================================================
// <Workbench role="player" /> — shared shell, ported from v10
// (Workbench.html → WorkbenchDirA composition).
//
// BOLK 1+2 scope: Calendar formspråk (A) only, with WeekView (UKE,
// default), DayView (DAG), KanbanView (KANBAN) + DashboardView
// (DASHBOARD). The zoom segment (UKE/DAG) and the mode segment
// (Tidslinje/Kanban/Dashboard) switch the rendered view. The
// Liste/Kalender toggle (B) is still no-op — it is built in Bolk 3.
// The `role` prop drives the coach additions (search + bell in the
// topbar, 6 coach actions in the inspector), gated on role="coach".
// ============================================================

import { useState } from "react";
import { WBTopbar } from "./topbar";
import { WBSidebar } from "./sidebar";
import { WBInspector } from "./inspector";
import { WBStatusbar } from "./statusbar";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { KanbanView } from "./kanban-view";
import { DashboardView } from "./dashboard-view";
import "./workbench.css";

export type Role = "player" | "coach";
/** A: UKE/DAG/KANBAN/DASHBOARD · B: TIDSLINJE/KANBAN/DASHBOARD */
export type Mode = "UKE" | "DAG" | "KANBAN" | "DASHBOARD" | "TIDSLINJE";

type WorkbenchProps = {
  role?: Role;
  /** initial Calendar (A) mode — used by the preview route to land on
      a specific screen for screenshots. Default = "UKE" (matches v10). */
  initialMode?: Mode;
};

export function Workbench({ role = "player", initialMode = "UKE" }: WorkbenchProps) {
  // view: 'A' = kalender (default) | 'B' = liste (built in Bolk 3).
  // Kept in state so the Liste/Kalender toggle is wired for the future.
  const [view, setView] = useState<"A" | "B">("A");
  // UKE/DAG/KANBAN/DASHBOARD are rendered in this bolk; default = UKE.
  const [mode, setMode] = useState<Mode>(initialMode);

  const onVis = (v: "A" | "B") => {
    // No-op for Liste (B) in this bolk — stays on Kalender (A).
    if (v === "A") setView("A");
  };

  const onMode = (m: Mode) => {
    // UKE/DAG/KANBAN/DASHBOARD change the rendered view in this bolk.
    if (m === "UKE" || m === "DAG" || m === "KANBAN" || m === "DASHBOARD") setMode(m);
  };

  const viewEl =
    mode === "DAG" ? (
      <DayView />
    ) : mode === "KANBAN" ? (
      <KanbanView />
    ) : mode === "DASHBOARD" ? (
      <DashboardView />
    ) : (
      <WeekView />
    );

  return (
    <div className="akwb">
      {/* `view` is 'A' (kalender) in this bolk; 'B' (liste) lands in Bolk 3. */}
      <div className="wb" data-screen-label={`Workbench · ${view} · ${mode}`}>
        <WBTopbar
          role={role}
          activeMode={
            mode === "KANBAN" ? "kanban" : mode === "DASHBOARD" ? "dashboard" : "tidslinje"
          }
          activeZoom={mode === "DAG" ? "DAG" : "UKE"}
          onVis={onVis}
          onMode={onMode}
        />
        <div className="wb-main">
          <WBSidebar />
          {viewEl}
          <WBInspector role={role} />
        </div>
        <WBStatusbar />
      </div>
    </div>
  );
}
