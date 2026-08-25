/**
 * Workbench UI state machine — pure description + transitions.
 * Implement with useReducer or XState; this file is the contract.
 *
 * Scope for launch (A4):
 * - Week view (desktop Agency + player agenda)
 * - Create session (modal)
 * - Move / resize (drag or edit)
 * - Sources panel (drill bank + templates)
 * - Publish flow (single + batch)
 */

import type {
  WorkbenchSession,
  SourceItem,
  WeekViewModel,
  CreateSessionCommand,
  MoveSessionCommand,
} from "../domain/types";

// ─── State ──────────────────────────────────────────

export type WorkbenchUIState = {
  // Data
  week: WeekViewModel | null;
  sources: SourceItem[];
  selectedSessionId: string | null;
  /** Session being edited in modal / inspector */
  editingSession: WorkbenchSession | null;

  // UI flags
  sourcesOpen: boolean; // left panel
  inspectorOpen: boolean; // right panel
  createModalOpen: boolean;
  publishConfirmOpen: boolean;
  isDragging: boolean;
  dragSessionId: string | null;

  // Loading / error
  status: "idle" | "loading" | "saving" | "error";
  errorMessage: string | null;

  // Mode
  mode: "PLAYER" | "GROUP" | "AGENCY";
  subjectId: string; // player or group
};

export const initialWorkbenchState = (
  mode: WorkbenchUIState["mode"],
  subjectId: string
): WorkbenchUIState => ({
  week: null,
  sources: [],
  selectedSessionId: null,
  editingSession: null,
  sourcesOpen: true,
  inspectorOpen: false,
  createModalOpen: false,
  publishConfirmOpen: false,
  isDragging: false,
  dragSessionId: null,
  status: "idle",
  errorMessage: null,
  mode,
  subjectId,
});

// ─── Events ─────────────────────────────────────────

export type WorkbenchEvent =
  | { type: "WEEK_LOADED"; week: WeekViewModel }
  | { type: "SOURCES_LOADED"; sources: SourceItem[] }
  | { type: "SELECT_SESSION"; sessionId: string | null }
  | { type: "OPEN_CREATE" }
  | { type: "CLOSE_CREATE" }
  | { type: "CREATE_SESSION"; cmd: CreateSessionCommand }
  | { type: "SESSION_CREATED"; session: WorkbenchSession }
  | { type: "START_DRAG"; sessionId: string }
  | { type: "END_DRAG"; cmd: MoveSessionCommand }
  | { type: "SESSION_MOVED"; session: WorkbenchSession }
  | { type: "OPEN_PUBLISH_CONFIRM"; sessionId?: string }
  | { type: "CLOSE_PUBLISH_CONFIRM" }
  | { type: "CONFIRM_PUBLISH"; sessionIds: string[] }
  | { type: "SESSIONS_PUBLISHED"; sessions: WorkbenchSession[] }
  | { type: "TOGGLE_SOURCES" }
  | { type: "TOGGLE_INSPECTOR" }
  | { type: "ADD_DRILL_FROM_SOURCE"; sourceId: string; sessionId: string }
  | { type: "SET_STATUS"; status: WorkbenchUIState["status"]; error?: string }
  | { type: "NAV_WEEK"; direction: "prev" | "next" | "today" };

// ─── Transitions (pure) ───────────────────────────────────

export function workbenchReducer(
  state: WorkbenchUIState,
  event: WorkbenchEvent
): WorkbenchUIState {
  switch (event.type) {
    case "WEEK_LOADED":
      return {
        ...state,
        week: event.week,
        status: "idle",
        errorMessage: null,
      };

    case "SOURCES_LOADED":
      return { ...state, sources: event.sources };

    case "SELECT_SESSION":
      return {
        ...state,
        selectedSessionId: event.sessionId,
        inspectorOpen: event.sessionId !== null,
        editingSession:
          event.sessionId && state.week
            ? state.week.days
                .flatMap((d) => d.sessions)
                .find((s) => s.id === event.sessionId) ?? null
            : null,
      };

    case "OPEN_CREATE":
      return { ...state, createModalOpen: true };

    case "CLOSE_CREATE":
      return { ...state, createModalOpen: false };

    case "CREATE_SESSION":
      return { ...state, status: "saving", createModalOpen: false };

    case "SESSION_CREATED": {
      if (!state.week) return state;
      const date = event.session.date;
      const days = state.week.days.map((d) =>
        d.date === date
          ? {
              ...d,
              sessions: [...d.sessions, event.session].sort(
                (a, b) => a.startMinute - b.startMinute
              ),
            }
          : d
      );
      return {
        ...state,
        week: { ...state.week, days },
        status: "idle",
        selectedSessionId: event.session.id,
        inspectorOpen: true,
        editingSession: event.session,
      };
    }

    case "START_DRAG":
      return {
        ...state,
        isDragging: true,
        dragSessionId: event.sessionId,
      };

    case "END_DRAG":
      return {
        ...state,
        isDragging: false,
        dragSessionId: null,
        status: "saving",
      };

    case "SESSION_MOVED": {
      if (!state.week) return state;
      const days = state.week.days.map((d) => ({
        ...d,
        sessions: d.sessions
          .filter((s) => s.id !== event.session.id)
          .concat(d.date === event.session.date ? [event.session] : [])
          .sort((a, b) => a.startMinute - b.startMinute),
      }));
      return {
        ...state,
        week: { ...state.week, days },
        status: "idle",
        editingSession: event.session,
      };
    }

    case "OPEN_PUBLISH_CONFIRM":
      return {
        ...state,
        publishConfirmOpen: true,
        selectedSessionId: event.sessionId ?? state.selectedSessionId,
      };

    case "CLOSE_PUBLISH_CONFIRM":
      return { ...state, publishConfirmOpen: false };

    case "CONFIRM_PUBLISH":
      return { ...state, status: "saving", publishConfirmOpen: false };

    case "SESSIONS_PUBLISHED": {
      if (!state.week) return state;
      const map = new Map(event.sessions.map((s) => [s.id, s]));
      const days = state.week.days.map((d) => ({
        ...d,
        sessions: d.sessions.map((s) => map.get(s.id) ?? s),
      }));
      return {
        ...state,
        week: { ...state.week, days },
        status: "idle",
        editingSession:
          state.selectedSessionId && map.has(state.selectedSessionId)
            ? map.get(state.selectedSessionId)!
            : state.editingSession,
      };
    }

    case "TOGGLE_SOURCES":
      return { ...state, sourcesOpen: !state.sourcesOpen };

    case "TOGGLE_INSPECTOR":
      return { ...state, inspectorOpen: !state.inspectorOpen };

    case "SET_STATUS":
      return {
        ...state,
        status: event.status,
        errorMessage: event.error ?? null,
      };

    case "NAV_WEEK":
      return { ...state, status: "loading", selectedSessionId: null };

    default:
      return state;
  }
}

// ─── Selectors ────────────────────────────────────────

export function selectSelectedSession(
  state: WorkbenchUIState
): WorkbenchSession | null {
  if (!state.selectedSessionId || !state.week) return null;
  return (
    state.week.days
      .flatMap((d) => d.sessions)
      .find((s) => s.id === state.selectedSessionId) ?? null
  );
}

export function selectDraftCount(state: WorkbenchUIState): number {
  if (!state.week) return 0;
  return state.week.days
    .flatMap((d) => d.sessions)
    .filter((s) => s.status === "DRAFT").length;
}

export function selectPublishableIds(state: WorkbenchUIState): string[] {
  if (!state.week) return [];
  return state.week.days
    .flatMap((d) => d.sessions)
    .filter((s) => s.status === "DRAFT" || s.status === "SCHEDULED")
    .map((s) => s.id);
}
