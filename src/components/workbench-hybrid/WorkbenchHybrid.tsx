"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactElement } from "react";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import { FONT, WB, type Cat } from "./theme";
import type { DimField } from "./taxonomy";
import { omrArr } from "./helpers";
import type {
  PaletteItem,
  WbGoal,
  WbSession,
  WeekKey,
  WeekState,
  WorkbenchRole,
  ZoomLevel,
} from "./types";
import {
  DEMO_GOALS,
  DEMO_PALETTE,
  DEMO_SIDE_TESTS,
  DEMO_WARNING_BANNER,
  DEMO_WEEK,
  DEMO_WEEK_HEAD,
} from "./demo-data";
import { mapGoals, mapWarningBanner, mapWeek, mapWeekHead } from "./map-data";
import { Topbar } from "./Topbar";
import { PaletteSidebar } from "./PaletteSidebar";
import { UkeView } from "./UkeView";
import { DagView } from "./DagView";
import { StubView } from "./StubView";
import { Statusbar } from "./Statusbar";
import { Inspector, type InspectorMode } from "./Inspector";
import { DimPickerModal } from "./DimPickerModal";

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
  nextId: number;
};

type Action =
  | { type: "setLevel"; level: ZoomLevel }
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
  | { type: "writeField"; field: DimField; value: string | string[] };

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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setLevel":
      return { ...state, level: action.level, editScope: "session", selectedPaletteId: null };
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
  /** Coach-ekstra kommer i en senere fase — propen aksepteres allerede nå. */
  role?: WorkbenchRole;
  data?: WorkbenchData;
  playerName?: string;
  initials?: string;
};

export function WorkbenchHybrid({
  role = "player",
  data,
  playerName = "Øyvind Rohjan",
  initials = "ØR",
}: WorkbenchHybridProps): ReactElement {
  void role; // reservert for senere coach-faser

  // Ekte data der den finnes; ellers fasit-demo (alltid renderbar).
  const realWeek = useMemo(() => mapWeek(data), [data]);
  const goals: WbGoal[] = useMemo(() => mapGoals(data) ?? DEMO_GOALS, [data]);
  const weekHead = useMemo(() => mapWeekHead(data) ?? DEMO_WEEK_HEAD, [data]);
  const banner = useMemo(() => mapWarningBanner(data) ?? DEMO_WARNING_BANNER, [data]);

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

  return (
    <div
      style={{
        background: WB.pageBg,
        minHeight: "100vh",
        padding: "36px 28px 64px",
        fontFamily: FONT.sans,
        color: WB.limeDark,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`.wb-scroll::-webkit-scrollbar{width:0;height:0}`}</style>

      {/* above-panel header */}
      <div style={{ maxWidth: 1340, margin: "0 auto 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: WB.forest }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: WB.forest }}>
            AK Golf HQ · Workbench · All planlegging skjer her
          </span>
        </div>
        <h1 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          {headTitle}
        </h1>
        <p style={{ fontSize: 14, color: WB.subText, margin: 0 }}>{headSub}</p>
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
            {state.level === "arsplan" && <StubView label="Årsplan med periodisering" />}
            {state.level === "ar" && <StubView label="Årsvisning" />}
            {state.level === "maned" && <StubView label="Månedsvisning" />}
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
      </div>
    </div>
  );
}
