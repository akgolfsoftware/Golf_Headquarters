"use client";

// ============================================================
// <Workbench role="player" /> — shared shell, ported from v10
// (Workbench.html → WorkbenchDirA composition).
//
// BOLK 1 scope: Calendar formspråk (A) only, with WeekView (UKE,
// default) + DayView (DAG). The zoom segment (UKE/DAG) switches the
// rendered view. The Liste/Kalender toggle and the Kanban/Dashboard
// mode buttons exist visually but are no-op in this bolk — they are
// built in later bolker. The `role` prop and `mode`/`view` state are
// in place so the shell is ready for coach + Liste + Kanban/Dashboard.
// ============================================================

import { useState } from "react";
import { WBTopbar } from "./topbar";
import { WBSidebar } from "./sidebar";
import { WBInspector } from "./inspector";
import { WBStatusbar } from "./statusbar";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import "./workbench.css";

export type Role = "player" | "coach";
/** A: UKE/DAG/KANBAN/DASHBOARD · B: TIDSLINJE/KANBAN/DASHBOARD */
export type Mode = "UKE" | "DAG" | "KANBAN" | "DASHBOARD" | "TIDSLINJE";

type WorkbenchProps = {
  role?: Role;
};

export function Workbench({ role = "player" }: WorkbenchProps) {
  // view: 'A' = kalender (default) | 'B' = liste (built in a later bolk).
  // Kept in state so the Liste/Kalender toggle is wired for the future.
  const [view, setView] = useState<"A" | "B">("A");
  // Only UKE/DAG are rendered in this bolk; default = UKE (matches v10).
  const [mode, setMode] = useState<Mode>("UKE");

  const onVis = (v: "A" | "B") => {
    // No-op for Liste (B) in this bolk — stays on Kalender (A).
    if (v === "A") setView("A");
  };

  const onMode = (m: Mode) => {
    // Only UKE/DAG change the rendered view in this bolk.
    if (m === "UKE" || m === "DAG") setMode(m);
  };

  const viewEl = mode === "DAG" ? <DayView /> : <WeekView />;

  return (
    <div className="akwb">
      {/* `view` is 'A' (kalender) in this bolk; 'B' (liste) lands in a later bolk. */}
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
