"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactElement } from "react";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import { FONT, WB, type Cat } from "./theme";
import type { DimField } from "./taxonomy";
import { omrArr } from "./helpers";
import type {
  PaletteItem,
  Recur,
  WbGoal,
  WbSession,
  WeekKey,
  WeekState,
  WorkbenchRole,
  ZoomLevel,
} from "./types";
import {
  DEMO_GOALS,
  DEMO_MONTH_COUNTS,
  DEMO_MONTH_STATS,
  DEMO_PALETTE,
  DEMO_SAMPLE_MONTH,
  DEMO_SEASON_PHASES,
  DEMO_SIDE_TESTS,
  DEMO_TOURNAMENTS,
  DEMO_WARNING_BANNER,
  DEMO_WEEK,
  DEMO_WEEK_HEAD,
  DEMO_YEAR_LOAD,
  DEMO_YEAR_MARKERS,
} from "./demo-data";
import { mapGoals, mapTournaments, mapWarningBanner, mapWeek, mapWeekHead } from "./map-data";
import { Topbar, type RosterPlayer } from "./Topbar";
import { CoachSkillWizard } from "./CoachSkillWizard";
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

const LS_KEY = "akgolf.wb.level";
const VALID_LEVELS: ZoomLevel[] = ["arsplan", "ar", "maned", "uke", "dag"];

const HEADS: Record<ZoomLevel, [string, string]> = {
  arsplan: [
    "Årsplan med periodisering",
    "Makro-planen for hele sesongen — perioder, belastning og turneringer. All planlegging skjer i Workbench.",
  ],
  ar: ["Årsvisning 2026", "Oversikt over alle 12 månedene. Klikk en måned for å gå inn i den."],
  maned: ["Månedsvisning — juni 2026", "Hele måneden. Klikk en dag for å åpne dagsvisningen."],
  uke: ["Uke 24 — dra økter inn", "Dra fra standardøkter, flytt mellom dager, klikk for detaljer."],
  dag: ["Dagsvisning — onsdag 11. juni", "Tidslinje for dagen. Dra en økt inn for å plassere den på klokkeslett."],
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
};

export function WorkbenchHybrid({
  role = "player",
  data,
  playerName = "Øyvind Rohjan",
  initials = "ØR",
  coachName = "Anders Kristiansen",
  players,
  currentPlayerId,
}: WorkbenchHybridProps): ReactElement {
  const isCoach = role === "coach";

  // Coach-Skill-veiviseren (kun coach-modus) — åpen/lukket-tilstand.
  const [coachSkillOpen, setCoachSkillOpen] = useState(false);

  // Ekte data der den finnes; ellers fasit-demo (alltid renderbar).
  const realWeek = useMemo(() => mapWeek(data), [data]);
  const goals: WbGoal[] = useMemo(() => mapGoals(data) ?? DEMO_GOALS, [data]);
  const weekHead = useMemo(() => mapWeekHead(data) ?? DEMO_WEEK_HEAD, [data]);
  const banner = useMemo(() => mapWarningBanner(data) ?? DEMO_WARNING_BANNER, [data]);
  // Periodisering + turnerings-tidslinje har ingen Prisma-kilde ennå → fasit-demo.
  const tournaments = useMemo(() => mapTournaments(data) ?? DEMO_TOURNAMENTS, [data]);
  const seasonPhases = DEMO_SEASON_PHASES;

  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    level: "uke",
    week: realWeek ?? DEMO_WEEK,
    palette: DEMO_PALETTE,
    selectedId: null,
    selectedPaletteId: null,
    editScope: "session",
    hoverDay: null,
    panels: { palette: true, goals: false, tests: false, tech: false },
    dimPicker: null,
    selectedMonth: 5, // juni — fasitens demo-måned
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
  const onDayDrop = useCallback((day: WeekKey) => {
    dispatch({ type: "drop", day, drag: dragRef.current });
    dragRef.current = null;
  }, []);
  const onTimelineDrop = useCallback((time: string) => {
    dispatch({ type: "drop", day: "ons", time, drag: dragRef.current });
    dragRef.current = null;
  }, []);

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
        padding: "36px 28px 64px",
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

  return (
    <div style={wrapperStyle}>
      <style>{`.wb-scroll::-webkit-scrollbar{width:0;height:0}`}</style>

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
          onAddSession={() => dispatch({ type: "addSession" })}
          role={role}
          players={players}
          currentPlayerId={currentPlayerId}
          onOpenCoachSkill={isCoach ? () => setCoachSkillOpen(true) : undefined}
        />

        {/* body */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <PaletteSidebar
            open={state.panels}
            onToggle={(k) => dispatch({ type: "togglePanel", key: k })}
            palette={state.palette}
            selectedPaletteId={state.editScope === "palette" ? state.selectedPaletteId : null}
            goals={goals}
            sideTests={DEMO_SIDE_TESTS}
            testCount="30"
            onPaletteClick={(pid) => dispatch({ type: "selectPalette", pid })}
            onPaletteDragStart={onPaletteDragStart}
            onAddPalette={() => dispatch({ type: "addPalette" })}
          />

          {/* center */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* KPI-stripe — over alle zoom-visninger. Volum/pyramide fra ekte
                uke-data; adherence/SG er fasit-demo (ingen modell ennå). */}
            <KpiStrip
              totals={totals}
              grand={grand}
              sessionCount={kpiSessionCount}
              adherence="82%"
              sg="+1.8"
              onOpen={(key) => dispatch({ type: "openKpi", key })}
            />
            {state.level === "uke" && (
              <UkeView
                week={state.week}
                selectedId={state.editScope === "session" ? state.selectedId : null}
                hoverDay={state.hoverDay}
                weekLabel={weekHead.weekLabel}
                weekRange={weekHead.range}
                warningTitle={banner.title}
                warningMeta={banner.meta}
                onSessionClick={(id) => dispatch({ type: "selectSession", id })}
                onSessionDragStart={onSessionDragStart}
                onDayDragOver={(day) => dispatch({ type: "setHoverDay", day })}
                onDayDragLeave={(day) => state.hoverDay === day && dispatch({ type: "setHoverDay", day: null })}
                onDayDrop={onDayDrop}
              />
            )}
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
                load={DEMO_YEAR_LOAD}
                markers={DEMO_YEAR_MARKERS}
                onPhaseClick={() => {
                  /* Periode-inspektør er en senere fase — no-op for nå. */
                }}
              />
            )}
            {state.level === "ar" && (
              <ArView
                phases={seasonPhases}
                counts={DEMO_MONTH_COUNTS}
                onMonthClick={(month) => dispatch({ type: "openMonth", month })}
              />
            )}
            {state.level === "maned" && (
              <ManedView
                monthIndex={state.selectedMonth}
                phases={seasonPhases}
                week={state.week}
                totals={totals}
                tournaments={tournaments}
                sampleMonth={DEMO_SAMPLE_MONTH}
                baseStats={DEMO_MONTH_STATS}
                onPrev={() => dispatch({ type: "setMonth", month: state.selectedMonth - 1 })}
                onNext={() => dispatch({ type: "setMonth", month: state.selectedMonth + 1 })}
                onDayClick={() => setLevel("dag")}
              />
            )}
          </div>

          {inspectorMode && (
            <Inspector
              mode={inspectorMode}
              onClose={() => dispatch({ type: "closeInspector" })}
              onDimClick={(field) => dispatch({ type: "openDim", field })}
              onRemoveOmr={onRemoveOmr}
              onPaletteTitle={(title) => dispatch({ type: "patchPalette", patch: { title } })}
              onPaletteDur={(delta) => dispatch({ type: "patchPaletteDur", delta })}
              onRemoveSession={() => dispatch({ type: "removeSelected" })}
              onStart={() => {
                /* Live-økt er en senere fase — no-op for nå. */
              }}
              onOpenPlan={inspectorMode.kind === "session" ? () => dispatch({ type: "openPlan" }) : undefined}
              onOpenRecur={inspectorMode.kind === "session" ? () => dispatch({ type: "openRecur" }) : undefined}
              onOpenBank={inspectorMode.kind === "session" ? () => dispatch({ type: "openBank" }) : undefined}
            />
          )}
        </div>

        <Statusbar totals={totals} grand={grand} weekLabel={weekHead.weekLabel} />

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
              /* Live-økt er en senere fase — lukk overlay for nå. */
              dispatch({ type: "closeModal" });
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
      </div>

      {/* Coach-Skill-veiviser (kun coach-modus) */}
      {isCoach && coachSkillOpen && (
        <CoachSkillWizard
          coachName={coachName}
          currentPlayerName={playerName}
          currentInitials={initials}
          players={players ?? []}
          onClose={() => setCoachSkillOpen(false)}
        />
      )}
    </div>
  );
}
