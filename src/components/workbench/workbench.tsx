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
//
// W5b — real data: `data` (WorkbenchData) is optional. When present,
// the mappable surfaces (week grid, B-timeline, kanban, statusbar
// hours, sidebar tournaments/goals/pyramide, dashboard pie/summary)
// render from Prisma. Surfaces with no schema source (inspector,
// season-tree, SG, 8-week trends, balance, CS-difficulty, period
// targets) keep the v10 demo. When `data` is absent (preview route),
// every component falls back to demo — byte-for-byte v10.
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
import { CreatePlanSheet } from "./create-plan-sheet";
import { CreateSessionSheet } from "./create-session-sheet";
import { defaultSelectedSession, WEEK_DAYS, type SelectedSession } from "./data";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import "./workbench.css";

export type Role = "player" | "coach";
export type View = "A" | "B";
/** A: UKE/DAG/KANBAN/DASHBOARD · B: TIDSLINJE/KANBAN/DASHBOARD */
export type Mode = "UKE" | "DAG" | "KANBAN" | "DASHBOARD" | "TIDSLINJE";

const STORE_KEY = "akgolf.wb.view";

/** Minimal plan-rad som page.tsx sender ned — nok til å vise liste og sende id til sheet. */
export type WorkbenchPlan = {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  _count: { sessions: number };
};

type WorkbenchProps = {
  role?: Role;
  /** Ekte data fra loadWorkbenchData. Mangler/tom → v10-demo. */
  data?: WorkbenchData;
  /** Aktiv TrainingPlan-id. Brukes av CreateSessionSheet. */
  activePlanId?: string | null;
  /** Liste over brukerens planer — vises i topbar plan-toggle. */
  plans?: WorkbenchPlan[];
  /** spiller-id (coach-rute) — gir kontekst til coach-handlinger. */
  playerId?: string;
  /** spillernavn (coach-rute) — etiketter i coach-handlinger. */
  playerName?: string;
  /** initial mode — used by the preview route to land on a specific
      screen for screenshots. Default = "UKE" (A) / "TIDSLINJE" (B). */
  initialMode?: Mode;
  /** initial formspråk — "A" (kalender, default) or "B" (liste).
      When set (preview ?view=), it wins over the stored value so
      screenshots are deterministic. */
  initialView?: View;
  /** open B's drill-overlay on first render (preview ?drill=1).
      Only effective in B · TIDSLINJE. */
  initialDrill?: boolean;
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

export function Workbench({
  role = "player",
  data,
  activePlanId = null,
  plans = [],
  playerId,
  playerName,
  initialMode,
  initialView,
  initialDrill = false,
}: WorkbenchProps) {
  // view: 'A' = kalender (default) | 'B' = liste.
  const [view, setView] = useState<View>(() => resolveInitialView(initialView));
  // Valgt økt for inspektøren — start på demoens standardøkt (ONS · 14:00).
  // Klikk på en økt-blokk i uke-kalenderen oppdaterer denne.
  const [selectedSession, setSelectedSession] = useState<SelectedSession | null>(
    () => defaultSelectedSession(WEEK_DAYS),
  );
  // Unified mode across both vocabularies. An explicit initialMode wins;
  // otherwise the default depends on the resolved view (UKE for A,
  // TIDSLINJE for B).
  const [mode, setMode] = useState<Mode>(() => {
    if (initialMode !== undefined) return initialMode;
    return resolveInitialView(initialView) === "B" ? "TIDSLINJE" : "UKE";
  });

  // Sheet-state: ny plan og ny økt.
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false);

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

  // Felles sheets — monteres utenfor begge view-grener slik at de ikke
  // mister state ved visning-bytte.
  const sheets = (
    <>
      <CreatePlanSheet open={planSheetOpen} onOpenChange={setPlanSheetOpen} />
      <CreateSessionSheet
        open={sessionSheetOpen}
        onOpenChange={setSessionSheetOpen}
        planId={activePlanId ?? null}
      />
    </>
  );

  if (view === "B") {
    // Guard: a B-only mode must never leak into A's vocabulary and vice
    // versa. In B, DAG/UKE collapse to TIDSLINJE for the shell switch.
    const bMode: "TIDSLINJE" | "KANBAN" | "DASHBOARD" =
      mode === "KANBAN" ? "KANBAN" : mode === "DASHBOARD" ? "DASHBOARD" : "TIDSLINJE";
    return (
      <div className="akwb">
        <ListShell
          variant={role}
          mode={bMode}
          data={data}
          onVis={onVis}
          onMode={onMode}
          initialDrill={initialDrill}
          onNewPlan={() => setPlanSheetOpen(true)}
          onNewSession={() => setSessionSheetOpen(true)}
        />
        {sheets}
      </div>
    );
  }

  const viewEl =
    mode === "DAG" ? (
      <DayView />
    ) : mode === "KANBAN" ? (
      <KanbanView cols={data?.kanbanCols} />
    ) : mode === "DASHBOARD" ? (
      <DashboardView axisHours={data?.axisHours} summary={data?.summary} />
    ) : (
      <WeekView
        head={data?.weekHead}
        days={data?.weekDays}
        selectedKey={selectedSession?.key ?? null}
        onSelectSession={setSelectedSession}
      />
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
          activePlanId={activePlanId ?? null}
          plans={plans}
          onNewPlan={() => setPlanSheetOpen(true)}
          onNewSession={() => setSessionSheetOpen(true)}
        />
        <div className="wb-main">
          <WBSidebar tournaments={data?.tournaments} goals={data?.goals} pyramid={data?.pyramid} />
          {viewEl}
          <WBInspector
            role={role}
            selected={selectedSession}
            playerId={playerId}
            playerName={playerName}
          />
        </div>
        <WBStatusbar axisHours={data?.axisHours} summary={data?.summary} />
      </div>
      {sheets}
    </div>
  );
}
