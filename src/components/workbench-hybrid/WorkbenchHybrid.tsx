"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import { FONT, WB, type Cat } from "./theme";
import type { DimField } from "./taxonomy";
import { omrArr } from "./helpers";
import type {
  PaletteItem,
  Recur,
  SeasonPhase,
  WbGoal,
  WbSession,
  WeekKey,
  WeekState,
  WorkbenchRole,
  ZoomLevel,
} from "./types";
import { PALETTE_LIBRARY } from "./demo-data";
import { mapGoals, mapTournaments, mapWarningBanner, mapWeek, mapWeekHead } from "./map-data";
import { Topbar, type RosterPlayer } from "./Topbar";
import { CoachSkillWizard } from "./CoachSkillWizard";
import { AiPlanPanel } from "./AiPlanPanel";
import { PaletteSidebar } from "./PaletteSidebar";
import { UkeView } from "./UkeView";
import { DagView } from "./DagView";
import { ArsplanView } from "./ArsplanView";
import { ArView } from "./ArView";
import { ManedView } from "./ManedView";
import { Statusbar } from "./Statusbar";
import { Inspector, type InspectorMode } from "./Inspector";
import { DimPickerModal } from "./DimPickerModal";
import { KpiStrip, type KpiKey } from "./KpiStrip";
import { KpiDetailModal } from "./KpiDetailModal";
import { OktplanOverlay, type PlanMode } from "./OktplanOverlay";
import { RecurrenceEditor } from "./RecurrenceEditor";
import { OvelsesbankModal } from "./OvelsesbankModal";
import { MobileTopbar, MobileZoomRail } from "./MobileTopbar";
import { MobilePaletteSheet } from "./MobilePaletteSheet";
import { MobileInspectorSheet } from "./MobileInspectorSheet";
import { MobileStatusbar } from "./MobileStatusbar";
import { useMediaQuery, WB_MOBILE_QUERY } from "./use-media-query";
import {
  moveWorkbenchSession,
  addWorkbenchSession,
  removeWorkbenchSession,
} from "@/app/portal/planlegge/workbench/actions";
import {
  coachMoveWorkbenchSession,
  coachAddWorkbenchSession,
  coachRemoveWorkbenchSession,
  resolvePlanSessionLiveHref,
} from "@/lib/workbench/session-actions";
import { InsightsStripe } from "./InsightsStripe";
import { EmptyPlanState } from "./EmptyPlanState";

const LS_KEY = "akgolf.wb.level";
const VALID_LEVELS: ZoomLevel[] = ["arsplan", "ar", "maned", "uke", "dag"];

/** WeekKey → dag-indeks (mandag = 0), for persistering til DB-dato. */
const DAY_INDEX: Record<WeekKey, number> = {
  man: 0, tir: 1, ons: 2, tor: 3, fre: 4, lor: 5, son: 6,
};
/** Ekte DB-id (cuid) vs syntetisk klient-id (demo / ennå-ikke-lagret økt). */
const isPersisted = (id: string): boolean => /^c[a-z0-9]{20,}$/i.test(id);
/** "HH:MM" → {hour, minute}; default 09:00 når tid mangler ("—"). */
function parseTime(t: string | undefined): { hour: number; minute: number } {
  const parts = t && /^\d{1,2}:\d{2}$/.test(t) ? t.split(":") : null;
  if (!parts) return { hour: 9, minute: 0 };
  return { hour: Number(parts[0]), minute: Number(parts[1]) };
}

/** Tom uke når spilleren ennå ikke har planlagte økter (ingen oppdiktede økter). */
const EMPTY_WEEK: WeekState = { man: [], tir: [], ons: [], tor: [], fre: [], lor: [], son: [] };

/** Tom uke-header når data mangler — ingen oppdiktet uke-nr/datointervall. */
const EMPTY_WEEK_HEAD = { weekLabel: "Denne uka", range: "" };

/** Ingen sesong-periodisering ennå — Årsplan/År/Måned viser tomtilstand. */
const EMPTY_SEASON_PHASES: SeasonPhase[] = [];

const HEADS: Record<ZoomLevel, [string, string]> = {
  arsplan: [
    "Årsplan med periodisering",
    "Makro-planen for hele sesongen — perioder, belastning og turneringer. All planlegging skjer i Workbench.",
  ],
  ar: ["Årsvisning", "Oversikt over alle 12 månedene. Klikk en måned for å gå inn i den."],
  maned: ["Månedsvisning", "Hele måneden. Klikk en dag for å åpne dagsvisningen."],
  uke: ["Denne uka — dra økter inn", "Dra fra standardøkter, flytt mellom dager, klikk for detaljer."],
  dag: ["Dagsvisning", "Tidslinje for dagen. Dra en økt inn for å plassere den på klokkeslett."],
};

const DAY_NAMES: Record<WeekKey, string> = {
  man: "Man 9. jun",
  tir: "Tir 10. jun",
  ons: "Ons 11. jun",
  tor: "Tor 12. jun",
  fre: "Fre 13. jun",
  lor: "Lør 14. jun",
  son: "Søn 15. jun",
};

type PanelKey = "palette" | "goals" | "tests" | "tech";
type EditScope = "session" | "palette";
type DragState = { kind: "palette"; pid: string } | { kind: "move"; sid: string; from: WeekKey } | null;
/** Hvilken overlay/modal er åpen (én om gangen, rendres på shell-nivå). */
type ModalKind = "oktplan" | "recurrence" | "ovelsesbank" | "kpi" | null;

const DEFAULT_RECUR = (day: WeekKey): Recur => ({
  freq: "weekly",
  interval: 1,
  days: [day],
  endType: "count",
  endCount: 8,
  endDate: "31.08.2026",
});

type State = {
  level: ZoomLevel;
  week: WeekState;
  palette: PaletteItem[];
  selectedId: string | null;
  selectedPaletteId: string | null;
  editScope: EditScope;
  hoverDay: WeekKey | null;
  panels: Record<PanelKey, boolean>;
  dimPicker: DimField | null;
  /** valgt måned-index (0–11) for Måned-visningen */
  selectedMonth: number;
  /** åpen overlay/modal */
  modal: ModalKind;
  /** Øktplan: Bane vs Range */
  planMode: PlanMode;
  /** Gjentakelse-editorens arbeidskopi (skrives tilbake ved Lagre) */
  recurDraft: Recur | null;
  /** valgt KPI for detalj-modalen */
  kpiKey: KpiKey | null;
  nextId: number;
};

type Action =
  | { type: "setLevel"; level: ZoomLevel }
  | { type: "openMonth"; month: number }
  | { type: "setMonth"; month: number }
  | { type: "togglePanel"; key: PanelKey }
  | { type: "selectSession"; id: string }
  | { type: "selectPalette"; pid: string }
  | { type: "closeInspector" }
  | { type: "setHoverDay"; day: WeekKey | null }
  | { type: "drop"; day: WeekKey; time?: string; drag: DragState }
  | { type: "addSession" }
  | { type: "removeSelected" }
  | { type: "addPalette" }
  | { type: "patchPalette"; patch: Partial<PaletteItem> }
  | { type: "patchPaletteDur"; delta: number }
  | { type: "openDim"; field: DimField }
  | { type: "closeDim" }
  | { type: "writeField"; field: DimField; value: string | string[] }
  | { type: "openPlan" }
  | { type: "setPlanMode"; mode: PlanMode }
  | { type: "openRecur" }
  | { type: "patchRecur"; patch: Partial<Recur> }
  | { type: "saveRecur" }
  | { type: "openBank" }
  | { type: "pickBankItem"; title: string; meta: string }
  | { type: "openKpi"; key: KpiKey }
  | { type: "reconcileId"; oldId: string; newId: string }
  | { type: "closeModal" };

function cloneWeek(w: WeekState): WeekState {
  const out = {} as WeekState;
  (Object.keys(w) as WeekKey[]).forEach((k) => {
    out[k] = [...w[k]];
  });
  return out;
}

function findInWeek(w: WeekState, id: string | null): WbSession | null {
  if (!id) return null;
  for (const k of Object.keys(w) as WeekKey[]) {
    const s = w[k].find((x) => x.id === id);
    if (s) return s;
  }
  return null;
}

function dayKeyOf(w: WeekState, id: string | null): WeekKey | null {
  if (!id) return null;
  for (const k of Object.keys(w) as WeekKey[]) {
    if (w[k].some((s) => s.id === id)) return k;
  }
  return null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setLevel":
      return { ...state, level: action.level, editScope: "session", selectedPaletteId: null };
    case "openMonth":
      return { ...state, level: "maned", selectedMonth: action.month, editScope: "session", selectedPaletteId: null };
    case "setMonth":
      return { ...state, selectedMonth: Math.max(0, Math.min(11, action.month)) };
    case "togglePanel":
      return { ...state, panels: { ...state.panels, [action.key]: !state.panels[action.key] } };
    case "selectSession":
      return { ...state, selectedId: action.id, editScope: "session", selectedPaletteId: null };
    case "selectPalette":
      return { ...state, editScope: "palette", selectedPaletteId: action.pid };
    case "closeInspector":
      return { ...state, selectedId: null, selectedPaletteId: null, editScope: "session" };
    case "setHoverDay":
      return state.hoverDay === action.day ? state : { ...state, hoverDay: action.day };
    case "drop": {
      const drag = action.drag;
      if (!drag) return { ...state, hoverDay: null };
      const w = cloneWeek(state.week);
      if (drag.kind === "palette") {
        const p = state.palette.find((x) => x.pid === drag.pid);
        if (!p) return { ...state, hoverDay: null };
        const id = `s${state.nextId}`;
        const ns: WbSession = {
          id,
          title: p.title,
          dur: p.dur,
          cat: p.cat,
          time: action.time ?? "—",
          omr: p.omr,
          m: p.m,
          pr: p.pr,
          cs: p.cs,
          lfase: p.lfase,
          praksis: p.praksis,
          fysType: p.fysType,
          sone: p.sone,
        };
        w[action.day].push(ns);
        return { ...state, week: w, selectedId: id, editScope: "session", selectedPaletteId: null, hoverDay: null, nextId: state.nextId + 1 };
      }
      // move
      const idx = w[drag.from].findIndex((s) => s.id === drag.sid);
      if (idx > -1) {
        const [s] = w[drag.from].splice(idx, 1);
        if (action.time) s.time = action.time;
        w[action.day].push(s);
      }
      return { ...state, week: w, hoverDay: null };
    }
    case "addSession": {
      const w = cloneWeek(state.week);
      const id = `s${state.nextId}`;
      w.ons.push({ id, title: "Ny økt", dur: 60, cat: "TEK", time: "—" });
      const level = state.level === "ar" || state.level === "arsplan" || state.level === "maned" ? "uke" : state.level;
      return { ...state, week: w, selectedId: id, editScope: "session", selectedPaletteId: null, level, nextId: state.nextId + 1 };
    }
    case "removeSelected": {
      const w = cloneWeek(state.week);
      for (const k of Object.keys(w) as WeekKey[]) {
        const idx = w[k].findIndex((s) => s.id === state.selectedId);
        if (idx > -1) {
          w[k].splice(idx, 1);
          break;
        }
      }
      return { ...state, week: w, selectedId: null };
    }
    case "addPalette": {
      const pid = `p${state.nextId}`;
      const np: PaletteItem = { pid, title: "Ny standardøkt", dur: 60, cat: "TEK", omr: "TEE", m: "M2", pr: "PR2", cs: "CS80", lfase: "L_BALL", praksis: "BLOKK" };
      return { ...state, palette: [...state.palette, np], editScope: "palette", selectedPaletteId: pid, nextId: state.nextId + 1 };
    }
    case "patchPalette":
      return {
        ...state,
        palette: state.palette.map((p) => (p.pid === state.selectedPaletteId ? { ...p, ...action.patch } : p)),
      };
    case "patchPaletteDur":
      return {
        ...state,
        palette: state.palette.map((p) =>
          p.pid === state.selectedPaletteId ? { ...p, dur: Math.max(15, Math.min(240, p.dur + action.delta)) } : p,
        ),
      };
    case "openDim":
      return { ...state, dimPicker: action.field };
    case "closeDim":
      return { ...state, dimPicker: null };
    case "writeField": {
      if (state.editScope === "palette" && state.selectedPaletteId) {
        return {
          ...state,
          palette: state.palette.map((p) =>
            p.pid === state.selectedPaletteId ? { ...p, [action.field]: action.value } : p,
          ),
        };
      }
      const w = cloneWeek(state.week);
      for (const k of Object.keys(w) as WeekKey[]) {
        const idx = w[k].findIndex((s) => s.id === state.selectedId);
        if (idx > -1) {
          w[k][idx] = { ...w[k][idx], [action.field]: action.value };
          break;
        }
      }
      return { ...state, week: w };
    }
    case "openPlan":
      return { ...state, modal: "oktplan" };
    case "setPlanMode":
      return { ...state, planMode: action.mode };
    case "openRecur": {
      const sel = findInWeek(state.week, state.selectedId);
      const day = dayKeyOf(state.week, state.selectedId) ?? "ons";
      const seed = sel?.recur ? { ...sel.recur } : DEFAULT_RECUR(day);
      return { ...state, modal: "recurrence", recurDraft: seed };
    }
    case "patchRecur":
      return { ...state, recurDraft: state.recurDraft ? { ...state.recurDraft, ...action.patch } : state.recurDraft };
    case "saveRecur": {
      const d = state.recurDraft;
      const w = cloneWeek(state.week);
      for (const k of Object.keys(w) as WeekKey[]) {
        const idx = w[k].findIndex((s) => s.id === state.selectedId);
        if (idx > -1) {
          w[k][idx] = { ...w[k][idx], recur: d && d.freq !== "none" ? d : null };
          break;
        }
      }
      return { ...state, week: w, modal: null, recurDraft: null };
    }
    case "openBank":
      return { ...state, modal: "ovelsesbank" };
    case "pickBankItem": {
      // Plukk fra øvelsesbanken → ny økt på samme dag som den valgte (arver cat).
      const sel = findInWeek(state.week, state.selectedId);
      const day = dayKeyOf(state.week, state.selectedId) ?? "ons";
      const w = cloneWeek(state.week);
      const id = `s${state.nextId}`;
      const ns: WbSession = {
        id,
        title: action.title,
        dur: 45,
        cat: sel?.cat ?? "TEK",
        time: "—",
      };
      w[day].push(ns);
      return { ...state, week: w, modal: null, selectedId: id, editScope: "session", selectedPaletteId: null, nextId: state.nextId + 1 };
    }
    case "openKpi":
      return { ...state, modal: "kpi", kpiKey: action.key };
    case "closeModal":
      return { ...state, modal: null, recurDraft: null, kpiKey: null };
    case "reconcileId": {
      // Bytt en syntetisk id ut med DB-id-en etter at en ny økt er lagret,
      // så senere flytting/sletting av samme økt også persisterer.
      const w = cloneWeek(state.week);
      for (const k of Object.keys(w) as WeekKey[]) {
        const idx = w[k].findIndex((s) => s.id === action.oldId);
        if (idx > -1) {
          w[k][idx] = { ...w[k][idx], id: action.newId };
          break;
        }
      }
      return {
        ...state,
        week: w,
        selectedId: state.selectedId === action.oldId ? action.newId : state.selectedId,
      };
    }
    default:
      return state;
  }
}

function totalsOf(week: WeekState): { totals: Record<Cat, number>; grand: number } {
  const totals: Record<Cat, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  let grand = 0;
  (Object.keys(week) as WeekKey[]).forEach((k) =>
    week[k].forEach((s) => {
      totals[s.cat] += s.dur;
      grand += s.dur;
    }),
  );
  return { totals, grand };
}

export type WorkbenchHybridProps = {
  role?: WorkbenchRole;
  data?: WorkbenchData;
  playerName?: string;
  initials?: string;
  /** Coach-modus: coachens navn (vist i Coach-Skill-veiviseren). */
  coachName?: string;
  /** Coach-modus: spiller-roster for topbar-velgeren. */
  players?: RosterPlayer[];
  /** Coach-modus: id på spilleren Workbench står på nå. */
  currentPlayerId?: string;
  /** «Hvorfor denne uken» — fra loadWorkbenchContext. */
  insightsLine?: string | null;
};

export function WorkbenchHybrid({
  role = "player",
  data,
  playerName = "Øyvind Rohjan",
  initials = "ØR",
  coachName = "Anders Kristiansen",
  players,
  currentPlayerId,
  insightsLine,
}: WorkbenchHybridProps): ReactElement {
  const isCoach = role === "coach";
  const router = useRouter();

  // Coach-Skill-veiviseren (kun coach-modus) — åpen/lukket-tilstand.
  const [coachSkillOpen, setCoachSkillOpen] = useState(false);
  const [aiPlanOpen, setAiPlanOpen] = useState(false);

  // Mobil-tilstand (kun under lg). Palette + inspektør er bunn-ark på mobil;
  // tap-to-add legger en standardøkt på valgt dag (touch-fallback for DnD).
  const isMobile = useMediaQuery(WB_MOBILE_QUERY);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [mobileTargetDay, setMobileTargetDay] = useState<WeekKey>("ons");

  // Ekte data der den finnes; ellers tomme/ærlige tomtilstander (ingen oppdiktede tall).
  const realWeek = useMemo(() => mapWeek(data), [data]);
  const goals: WbGoal[] = useMemo(() => mapGoals(data) ?? [], [data]);
  const weekHead = useMemo(() => mapWeekHead(data) ?? EMPTY_WEEK_HEAD, [data]);
  const banner = useMemo(() => mapWarningBanner(data), [data]);
  // Turnerings-tidslinje har ingen Prisma-kilde med dato/type ennå → tom liste.
  const tournaments = useMemo(() => mapTournaments(data) ?? [], [data]);
  // Sesong-periodisering har ingen datamodell ennå → tom (Årsplan/År/Måned viser tomtilstand).
  const seasonPhases: SeasonPhase[] = EMPTY_SEASON_PHASES;

  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    level: "uke",
    week: realWeek ?? EMPTY_WEEK,
    palette: PALETTE_LIBRARY,
    selectedId: null,
    selectedPaletteId: null,
    editScope: "session",
    hoverDay: null,
    panels: { palette: true, goals: false, tests: false, tech: false },
    dimPicker: null,
    // Naviger til inneværende måned (lazy-init, kjører kun ved montering — ikke i render).
    selectedMonth: new Date().getMonth(),
    modal: null,
    planMode: "BANE",
    recurDraft: null,
    kpiKey: null,
    nextId: 100,
  }));

  // Restaurer zoom-nivå fra localStorage (klient).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_KEY);
      if (saved && (VALID_LEVELS as string[]).includes(saved) && saved !== state.level) {
        dispatch({ type: "setLevel", level: saved as ZoomLevel });
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLevel = useCallback((level: ZoomLevel) => {
    dispatch({ type: "setLevel", level });
    try {
      window.localStorage.setItem(LS_KEY, level);
    } catch {
      /* ignore */
    }
  }, []);

  // Escape lukker det øverste laget: dim-picker → modal → inspektør.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (state.dimPicker) dispatch({ type: "closeDim" });
      else if (state.modal) dispatch({ type: "closeModal" });
      else dispatch({ type: "closeInspector" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.dimPicker, state.modal]);

  // Hva som dras (palette-mal eller flytting av en eksisterende økt) holdes i en
  // ref — det er forbigående DnD-tilstand som ikke skal trigge re-render.
  const dragRef = useRef<DragState>(null);

  const onPaletteDragStart = useCallback((pid: string) => {
    dragRef.current = { kind: "palette", pid };
  }, []);
  const onSessionDragStart = useCallback((sid: string, from: WeekKey) => {
    dragRef.current = { kind: "move", sid, from };
  }, []);

  // Persister drag-drop til DB — KUN spiller-modus (coach-modus rører ikke
  // spillerens lagrede plan herfra). Move = flytt eksisterende økt til ny dag;
  // palette = opprett ny økt og bytt den syntetiske id-en mot DB-id-en.
  const persistDrop = useCallback(
    (drag: DragState, dayKey: WeekKey, time: string | undefined, expectedNewId: string) => {
      if (!drag) return;
      const dayIndex = DAY_INDEX[dayKey];
      if (drag.kind === "move") {
        if (!isPersisted(drag.sid)) return;
        if (isCoach && currentPlayerId) {
          void coachMoveWorkbenchSession(currentPlayerId, drag.sid, dayIndex);
        } else if (!isCoach) {
          void moveWorkbenchSession(drag.sid, dayIndex);
        }
        return;
      }
      const item = state.palette.find((p) => p.pid === drag.pid);
      if (!item) return;
      const { hour, minute } = parseTime(time);
      const payload = {
        dayIndex,
        title: item.title,
        durMin: item.dur,
        area: item.cat,
        hour,
        minute,
      };
      const promise =
        isCoach && currentPlayerId
          ? coachAddWorkbenchSession(currentPlayerId, payload)
          : !isCoach
            ? addWorkbenchSession(payload)
            : null;
      void promise?.then((res) => {
        if (res?.ok && res.sessionId) {
          dispatch({ type: "reconcileId", oldId: expectedNewId, newId: res.sessionId });
        }
      });
    },
    [isCoach, currentPlayerId, state.palette],
  );

  const onDayDrop = useCallback(
    (day: WeekKey) => {
      const drag = dragRef.current;
      const expectedNewId = `s${state.nextId}`;
      dispatch({ type: "drop", day, drag });
      dragRef.current = null;
      persistDrop(drag, day, undefined, expectedNewId);
    },
    [state.nextId, persistDrop],
  );
  const onTimelineDrop = useCallback(
    (time: string) => {
      const drag = dragRef.current;
      const expectedNewId = `s${state.nextId}`;
      dispatch({ type: "drop", day: "ons", time, drag });
      dragRef.current = null;
      persistDrop(drag, "ons", time, expectedNewId);
    },
    [state.nextId, persistDrop],
  );

  // "+"-knappen: reduceren legger "Ny økt" (60m TEK) på onsdag. Persister samme.
  const handleAddSession = useCallback(() => {
    const expectedNewId = `s${state.nextId}`;
    dispatch({ type: "addSession" });
    const payload = {
      dayIndex: DAY_INDEX.ons,
      title: "Ny økt",
      durMin: 60,
      area: "TEK" as const,
      hour: 9,
      minute: 0,
    };
    const promise =
      isCoach && currentPlayerId
        ? coachAddWorkbenchSession(currentPlayerId, payload)
        : !isCoach
          ? addWorkbenchSession(payload)
          : null;
    void promise?.then((res) => {
      if (res?.ok && res.sessionId) {
        dispatch({ type: "reconcileId", oldId: expectedNewId, newId: res.sessionId });
      }
    });
  }, [state.nextId, isCoach, currentPlayerId]);

  // Slett valgt økt: fjern optimistisk + persister hvis den allerede er lagret.
  const handleRemoveSelected = useCallback(() => {
    const id = state.selectedId;
    dispatch({ type: "removeSelected" });
    if (!id || !isPersisted(id)) return;
    if (isCoach && currentPlayerId) {
      void coachRemoveWorkbenchSession(currentPlayerId, id);
    } else if (!isCoach) {
      void removeWorkbenchSession(id);
    }
  }, [state.selectedId, isCoach, currentPlayerId]);

  const handleStartLive = useCallback(() => {
    const id = state.selectedId;
    if (!id || !isPersisted(id)) return;
    void resolvePlanSessionLiveHref(id, isCoach ? currentPlayerId : undefined).then((res) => {
      if (res.ok && res.href) router.push(res.href);
    });
  }, [state.selectedId, isCoach, currentPlayerId, router]);

  // Mobil tap-to-add: legg en standardøkt på valgt dag (Dag-visning → "ons").
  const onMobileAddToDay = useCallback(
    (pid: string) => {
      const day = state.level === "dag" ? "ons" : mobileTargetDay;
      const expectedNewId = `s${state.nextId}`;
      dispatch({ type: "drop", day, drag: { kind: "palette", pid } });
      setMobilePaletteOpen(false);
      persistDrop({ kind: "palette", pid }, day, undefined, expectedNewId);
    },
    [state.level, state.nextId, mobileTargetDay, persistDrop],
  );

  // Dimensjon-velger-handlere (skiller multi/omr fra single).
  const editTarget: WbSession | PaletteItem | null =
    state.editScope === "palette" && state.selectedPaletteId
      ? state.palette.find((p) => p.pid === state.selectedPaletteId) ?? null
      : findInWeek(state.week, state.selectedId);

  const onDimPick = useCallback(
    (value: string) => {
      const field = state.dimPicker;
      if (!field) return;
      if (field === "omr") {
        if (!editTarget) return;
        const arr = omrArr(editTarget);
        const next = arr.includes(value)
          ? arr.length > 1
            ? arr.filter((x) => x !== value)
            : arr
          : [...arr, value];
        dispatch({ type: "writeField", field: "omr", value: next });
        // omr er multi → modalen blir åpen for flere valg
      } else {
        dispatch({ type: "writeField", field, value });
        dispatch({ type: "closeDim" });
      }
    },
    [state.dimPicker, editTarget],
  );

  const onRemoveOmr = useCallback(
    (value: string) => {
      if (!editTarget) return;
      const arr = omrArr(editTarget);
      if (arr.length > 1) dispatch({ type: "writeField", field: "omr", value: arr.filter((x) => x !== value) });
    },
    [editTarget],
  );

  const { totals, grand } = totalsOf(state.week);
  const selectedSession = findInWeek(state.week, state.selectedId);

  // KPI "antall økter": ekte summary-tall der det finnes, ellers ukens egne økter.
  const kpiSessionCount =
    data?.summary?.sessionCount ??
    (Object.keys(state.week) as WeekKey[]).reduce((n, k) => n + state.week[k].length, 0);

  const weekIsEmpty = (Object.keys(state.week) as WeekKey[]).every((k) => state.week[k].length === 0);

  // Inspektør-modus
  let inspectorMode: InspectorMode | null = null;
  if (state.editScope === "palette" && state.selectedPaletteId) {
    const item = state.palette.find((p) => p.pid === state.selectedPaletteId);
    if (item) inspectorMode = { kind: "palette", item };
  } else if (selectedSession) {
    let dayKey: WeekKey = "ons";
    for (const k of Object.keys(state.week) as WeekKey[]) {
      if (state.week[k].some((s) => s.id === selectedSession.id)) {
        dayKey = k;
        break;
      }
    }
    const dayLabel = DAY_NAMES[dayKey] + (selectedSession.time && selectedSession.time !== "—" ? ` · ${selectedSession.time}` : "");
    inspectorMode = { kind: "session", session: selectedSession, dayLabel };
  }

  // Header-tittel: uke bruker ekte ukenr når data finnes.
  const [headTitleRaw, headSub] = HEADS[state.level];
  const headTitle =
    state.level === "uke" ? `${weekHead.weekLabel} — dra økter inn` : headTitleRaw;

  // omr valgte verdier til dim-picker
  const dimSelected =
    state.dimPicker === "omr" && editTarget
      ? omrArr(editTarget)
      : state.dimPicker && editTarget
        ? [(editTarget as Record<string, unknown>)[state.dimPicker] as string].filter(Boolean)
        : [];

  // Coach-modus er innleiret i AdminShell (mørk side-chrome finnes alt) → ingen
  // sand-bakgrunn / egen 100vh-wrapper. Spiller-modus beholder standalone-flaten.
  // Player-modus: padding styres av .wb-player-klassen (trang på mobil, fasit på lg).
  const wrapperStyle: React.CSSProperties = isCoach
    ? {
        padding: "24px 28px 40px",
        fontFamily: FONT.sans,
        color: WB.text,
        WebkitFontSmoothing: "antialiased",
      }
    : {
        background: WB.pageBg,
        minHeight: "100vh",
        fontFamily: FONT.sans,
        color: WB.limeDark,
        WebkitFontSmoothing: "antialiased",
      };

  // Mørk header på card-bakgrunn passer inn i AdminShell; sand-header på lyst.
  const eyebrowColor = isCoach ? WB.lime : WB.forest;
  const eyebrowText = isCoach
    ? `AK Golf HQ · Workbench · ${coachName} · Head Coach`
    : "AK Golf HQ · Workbench · All planlegging skjer her";
  const titleColor = isCoach ? WB.text : WB.limeDark;
  const subColor = isCoach ? WB.muted : WB.subText;

  // Senter-zoom-visningen — én definisjon, gjenbrukt i desktop-panelet og i
  // mobil-layoutet (begge bruker samme view-komponenter og handlere).
  const centerView = (
    <>
      {state.level === "uke" &&
        (weekIsEmpty ? (
          <EmptyPlanState role={role} />
        ) : (
          <UkeView
            week={state.week}
            selectedId={state.editScope === "session" ? state.selectedId : null}
            hoverDay={state.hoverDay}
            weekLabel={weekHead.weekLabel}
            weekRange={weekHead.range}
            warningTitle={banner?.title ?? null}
            warningMeta={banner?.meta ?? null}
            onSessionClick={(id) => dispatch({ type: "selectSession", id })}
            onSessionDragStart={onSessionDragStart}
            onDayDragOver={(day) => dispatch({ type: "setHoverDay", day })}
            onDayDragLeave={(day) => state.hoverDay === day && dispatch({ type: "setHoverDay", day: null })}
            onDayDrop={onDayDrop}
          />
        ))}
      {state.level === "dag" && (
        <DagView
          daySessions={state.week.ons}
          selectedId={state.editScope === "session" ? state.selectedId : null}
          onSessionClick={(id) => dispatch({ type: "selectSession", id })}
          onTimelineDrop={onTimelineDrop}
        />
      )}
      {state.level === "arsplan" && (
        <ArsplanView
          phases={seasonPhases}
          onPhaseClick={() => {
            /* Periode-inspektør er en senere fase — no-op for nå. */
          }}
        />
      )}
      {state.level === "ar" && (
        <ArView phases={seasonPhases} onMonthClick={(month) => dispatch({ type: "openMonth", month })} />
      )}
      {state.level === "maned" && (
        <ManedView
          monthIndex={state.selectedMonth}
          phases={seasonPhases}
          week={state.week}
          totals={totals}
          tournaments={tournaments}
          onPrev={() => dispatch({ type: "setMonth", month: state.selectedMonth - 1 })}
          onNext={() => dispatch({ type: "setMonth", month: state.selectedMonth + 1 })}
          onDayClick={() => setLevel("dag")}
        />
      )}
    </>
  );

  const kpiStrip = (
    <KpiStrip
      totals={totals}
      grand={grand}
      sessionCount={kpiSessionCount}
      // Adherence + SG har ingen datamodell ennå → ærlig tomtilstand ("—"), ikke oppdiktede tall.
      adherence={null}
      sg={null}
      onOpen={(key) => dispatch({ type: "openKpi", key })}
    />
  );

  // Mobil-inspektør vises kun når noe er valgt OG vi er på mobil.
  const mobileInspectorOpen = isMobile && inspectorMode !== null;

  return (
    <div style={wrapperStyle} className={isCoach ? "wb-root" : "wb-root wb-player"}>
      <style>{`
        .wb-scroll::-webkit-scrollbar{width:0;height:0}
        /* Desktop-panelet (fast 820px/1340px) vises kun fra lg (1024px) og opp. */
        .wb-desktop{display:none}
        .wb-mobile{display:flex;flex-direction:column}
        @media (min-width:1024px){
          .wb-desktop{display:block}
          .wb-mobile{display:none}
        }
        /* Spiller-modus: trang sidepadding på mobil, fasit-padding fra lg. */
        .wb-root.wb-player{padding:16px 14px 40px}
        @media (min-width:1024px){.wb-root.wb-player{padding:36px 28px 64px}}
      `}</style>

      {/* ───────── DESKTOP (lg+) ───────── */}
      <div className="wb-desktop">
        {/* above-panel header */}
        <div style={{ maxWidth: 1340, margin: "0 auto 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: eyebrowColor }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: eyebrowColor }}>
              {eyebrowText}
            </span>
          </div>
          <h1 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 4px", color: titleColor }}>
            {headTitle}
          </h1>
          <p style={{ fontSize: 14, color: subColor, margin: 0 }}>{headSub}</p>
        </div>

        {/* panel */}
        <div
          style={{
            position: "relative",
            maxWidth: 1340,
            margin: "0 auto",
            background: WB.panelBg,
            border: `1px solid ${WB.panelBorder}`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 30px 60px -24px rgba(15,42,34,0.55)",
            display: "flex",
            flexDirection: "column",
            height: 820,
          }}
        >
          <Topbar
            level={state.level}
            onLevel={setLevel}
            playerName={playerName}
            initials={initials}
            onAddSession={handleAddSession}
            role={role}
            players={players}
            currentPlayerId={currentPlayerId}
            onOpenCoachSkill={isCoach ? () => setCoachSkillOpen(true) : undefined}
            onOpenAiPlan={isCoach && currentPlayerId ? () => setAiPlanOpen(true) : undefined}
          />

          {/* body */}
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <PaletteSidebar
              open={state.panels}
              onToggle={(k) => dispatch({ type: "togglePanel", key: k })}
              palette={state.palette}
              selectedPaletteId={state.editScope === "palette" ? state.selectedPaletteId : null}
              goals={goals}
              sideTests={[]}
              testCount=""
              onPaletteClick={(pid) => dispatch({ type: "selectPalette", pid })}
              onPaletteDragStart={onPaletteDragStart}
              onAddPalette={() => dispatch({ type: "addPalette" })}
            />

            {/* center */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {/* KPI-stripe — over alle zoom-visninger. Volum/pyramide fra ekte
                  uke-data; adherence/SG er fasit-demo (ingen modell ennå). */}
              <InsightsStripe line={insightsLine ?? null} />
              {kpiStrip}
              {centerView}
            </div>

            {/* Desktop-inspektør (høyre-kolonne) — kun når noe er valgt OG vi ikke
                er på mobil (mobil viser inspektøren som bunn-ark i stedet). */}
            {inspectorMode && !isMobile && (
              <Inspector
                mode={inspectorMode}
                onClose={() => dispatch({ type: "closeInspector" })}
                onDimClick={(field) => dispatch({ type: "openDim", field })}
                onRemoveOmr={onRemoveOmr}
                onPaletteTitle={(title) => dispatch({ type: "patchPalette", patch: { title } })}
                onPaletteDur={(delta) => dispatch({ type: "patchPaletteDur", delta })}
                onRemoveSession={handleRemoveSelected}
                onStart={handleStartLive}
                onOpenPlan={inspectorMode.kind === "session" ? () => dispatch({ type: "openPlan" }) : undefined}
                onOpenRecur={inspectorMode.kind === "session" ? () => dispatch({ type: "openRecur" }) : undefined}
                onOpenBank={inspectorMode.kind === "session" ? () => dispatch({ type: "openBank" }) : undefined}
              />
            )}
          </div>

          <Statusbar totals={totals} grand={grand} weekLabel={weekHead.weekLabel} volMin={data?.volTarget?.min} volMax={data?.volTarget?.max} />
        </div>
      </div>

      {/* ───────── MOBIL (<lg) ───────── */}
      <div
        className="wb-mobile"
        style={{
          background: WB.panelBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          minHeight: "calc(100dvh - 56px)",
        }}
      >
        <MobileTopbar
          playerName={playerName}
          initials={initials}
          onAddSession={() => dispatch({ type: "addSession" })}
          onOpenPalette={() => setMobilePaletteOpen(true)}
          role={role}
          players={players}
          currentPlayerId={currentPlayerId}
          onOpenCoachSkill={isCoach ? () => setCoachSkillOpen(true) : undefined}
        />
        <MobileZoomRail level={state.level} onLevel={setLevel} />
        <InsightsStripe line={insightsLine ?? null} />
        {kpiStrip}
        {/* Én visning om gangen. Uke-rutenettet (8 kolonner) scroller horisontalt
            via en min-bredde; Dag-tidslinja og Årsplan/År/Måned reflow-er til full bredde. */}
        <div className="wb-scroll" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowX: state.level === "uke" ? "auto" : "hidden" }}>
          <div style={{ flex: 1, minWidth: state.level === "uke" ? 680 : 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {centerView}
          </div>
        </div>
        <MobileStatusbar totals={totals} grand={grand} weekLabel={weekHead.weekLabel} volMin={data?.volTarget?.min} volMax={data?.volTarget?.max} />
      </div>

      {/* ───────── DELTE OVERLAYS (begge layouts) ───────── */}

      {/* Mobil palette-ark */}
      <MobilePaletteSheet
        open={mobilePaletteOpen}
        onClose={() => setMobilePaletteOpen(false)}
        palette={state.palette}
        goals={goals}
        sideTests={[]}
        testCount=""
        targetDay={mobileTargetDay}
        onTargetDay={setMobileTargetDay}
        onAddToDay={onMobileAddToDay}
        onPaletteDragStart={onPaletteDragStart}
        onAddPalette={() => {
          dispatch({ type: "addPalette" });
          setMobilePaletteOpen(false);
        }}
      />

      {/* Mobil inspektør-ark (gjenbruker Inspector i sheet-variant) */}
      {mobileInspectorOpen && inspectorMode && (
        <MobileInspectorSheet
          mode={inspectorMode}
          onClose={() => dispatch({ type: "closeInspector" })}
          onDimClick={(field) => dispatch({ type: "openDim", field })}
          onRemoveOmr={onRemoveOmr}
          onPaletteTitle={(title) => dispatch({ type: "patchPalette", patch: { title } })}
          onPaletteDur={(delta) => dispatch({ type: "patchPaletteDur", delta })}
          onRemoveSession={() => dispatch({ type: "removeSelected" })}
          onStart={handleStartLive}
          onOpenPlan={inspectorMode.kind === "session" ? () => dispatch({ type: "openPlan" }) : undefined}
          onOpenRecur={inspectorMode.kind === "session" ? () => dispatch({ type: "openRecur" }) : undefined}
          onOpenBank={inspectorMode.kind === "session" ? () => dispatch({ type: "openBank" }) : undefined}
        />
      )}

      {state.dimPicker && (
        <DimPickerModal
          field={state.dimPicker}
          selected={dimSelected}
          multi={state.dimPicker === "omr"}
          onPick={onDimPick}
          onClose={() => dispatch({ type: "closeDim" })}
        />
      )}

      {/* Øktplan-overlay */}
      {state.modal === "oktplan" && selectedSession && (
        <OktplanOverlay
          session={selectedSession}
          dayKey={dayKeyOf(state.week, selectedSession.id) ?? "ons"}
          mode={state.planMode}
          onMode={(mode) => dispatch({ type: "setPlanMode", mode })}
          onClose={() => dispatch({ type: "closeModal" })}
          onStart={() => {
            dispatch({ type: "closeModal" });
            handleStartLive();
          }}
        />
      )}

      {/* Gjentakelse-editor */}
      {state.modal === "recurrence" && state.recurDraft && (
        <RecurrenceEditor
          draft={state.recurDraft}
          onPatch={(patch) => dispatch({ type: "patchRecur", patch })}
          onSave={() => dispatch({ type: "saveRecur" })}
          onClose={() => dispatch({ type: "closeModal" })}
        />
      )}

      {/* Øvelsesbank */}
      {state.modal === "ovelsesbank" && selectedSession && (
        <OvelsesbankModal
          isFys={selectedSession.cat === "FYS"}
          onClose={() => dispatch({ type: "closeModal" })}
          onPick={(title, meta) => dispatch({ type: "pickBankItem", title, meta })}
        />
      )}

      {/* KPI-detalj */}
      {state.modal === "kpi" && state.kpiKey && (
        <KpiDetailModal
          kpiKey={state.kpiKey}
          totals={totals}
          grand={grand}
          onClose={() => dispatch({ type: "closeModal" })}
        />
      )}

      {/* Coach-Skill-veiviser (kun coach-modus) */}
      {isCoach && coachSkillOpen && (
        <CoachSkillWizard
          coachName={coachName}
          currentPlayerName={playerName}
          currentInitials={initials}
          currentPlayerId={currentPlayerId ?? ""}
          players={players ?? []}
          onClose={() => setCoachSkillOpen(false)}
        />
      )}

      {/* AI-plan-panel (kun coach-modus, én spiller) */}
      {isCoach && aiPlanOpen && currentPlayerId && (
        <AiPlanPanel
          playerId={currentPlayerId}
          playerName={playerName}
          onClose={() => setAiPlanOpen(false)}
        />
      )}
    </div>
  );
}
