"use client";

// ============================================================
// <Workbench role="player" /> — shared shell, ported from v10
// (Workbench.html → WorkbenchSwitchable composition).
//
// Two formspråk live side by side, switched by the Liste/Kalender
// toggle in either topbar (mirrors v10 WorkbenchSwitchable):
//   A = Kalender (Bolk 1+2): WeekView (UKE, default), DayView (DAG),
//       KanbanView (KANBAN), DashboardView (DASHBOARD).
//   B = Liste (Bolk 3): DirB tidslinje (TIDSLINJE, default for B),
//       kanban (KANBAN), dashboard (DASHBOARD) via ListShell.
//
// The active view is persisted in localStorage ("akgolf.wb.view",
// default "A"). On switch, modes map across the two vocabularies:
// A·UKE ↔ B·TIDSLINJE, while KANBAN/DASHBOARD carry over unchanged.
// The `role` prop drives the coach additions (search + bell, coach
// actions in A; bell in B), gated on role="coach".
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
import { ListShell } from "./list-shell";
import "./workbench.css";

export type Role = "player" | "coach";
export type View = "A" | "B";
/** A: UKE/DAG/KANBAN/DASHBOARD · B: TIDSLINJE/KANBAN/DASHBOARD */
export type Mode = "UKE" | "DAG" | "KANBAN" | "DASHBOARD" | "TIDSLINJE";

const STORE_KEY = "akgolf.wb.view";

type WorkbenchProps = {
  role?: Role;
  /** initial mode — used by the preview route to land on a specific
      screen for screenshots. Default = "UKE" (A) / "TIDSLINJE" (B). */
  initialMode?: Mode;
  /** initial formspråk — "A" (kalender, default) or "B" (liste).
      When set (preview ?view=), it wins over the stored value so
      screenshots are deterministic. */
  initialView?: View;
};

/** Resolve the initial formspråk: an explicit `initialView` (preview
    ?view=) always wins; otherwise restore the persisted value, default
    "A". SSR-safe — the lazy initializer returns the default on the server
    (no localStorage), mirroring the project's wizard.tsx convention and
    v10's WorkbenchSwitchable. */
function resolveInitialView(initialView?: View): View {
  if (initialView !== undefined) return initialView;
  if (typeof window === "undefined") return "A";
  try {
    const stored = window.localStorage.getItem(STORE_KEY);
    if (stored === "A" || stored === "B") return stored;
  } catch {
    /* private mode — fall through */
  }
  return "A";
}

export function Workbench({ role = "player", initialMode, initialView }: WorkbenchProps) {
  // view: 'A' = kalender (default) | 'B' = liste.
  const [view, setView] = useState<View>(() => resolveInitialView(initialView));
  // Unified mode across both vocabularies. An explicit initialMode wins;
  // otherwise the default depends on the resolved view (UKE for A,
  // TIDSLINJE for B).
  const [mode, setMode] = useState<Mode>(() => {
    if (initialMode !== undefined) return initialMode;
    return resolveInitialView(initialView) === "B" ? "TIDSLINJE" : "UKE";
  });

  // Liste/Kalender toggle — switch formspråk + persist + map mode.
  const onVis = (v: View) => {
    if (v === view) return;
    setView(v);
    try {
      localStorage.setItem(STORE_KEY, v);
    } catch {
      /* ignore (private mode / SSR) */
    }
    setMode((m) => {
      // Shared modes carry over; otherwise map week ↔ timeline.
      if (m === "KANBAN" || m === "DASHBOARD") return m;
      return v === "B" ? "TIDSLINJE" : "UKE";
    });
  };

  const onMode = (m: Mode) => setMode(m);

  if (view === "B") {
    // Guard: a B-only mode must never leak into A's vocabulary and vice
    // versa. In B, DAG/UKE collapse to TIDSLINJE for the shell switch.
    const bMode: "TIDSLINJE" | "KANBAN" | "DASHBOARD" =
      mode === "KANBAN" ? "KANBAN" : mode === "DASHBOARD" ? "DASHBOARD" : "TIDSLINJE";
    return (
      <div className="akwb">
        <ListShell variant={role} mode={bMode} onVis={onVis} onMode={onMode} />
      </div>
    );
  }

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
