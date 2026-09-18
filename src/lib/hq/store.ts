import { create } from "zustand";

type FysSetLog = {
  id: string;
  planReps: number;
  actualReps: number;
  kg: number;
  rir: number | null;
};

function rirSuggestion(kg: number, rir: number): number {
  if (rir >= 4) return kg + 5;
  if (rir >= 3) return kg + 2.5;
  if (rir <= 0) return Math.max(20, kg - 5);
  return kg;
}

export type SessionStatus = "planlagt" | "pagar" | "pauset" | "delvis" | "gjennomfort";
export type SaveState = "idle" | "lagrer" | "lagret" | "offline" | "feilet" | "ukjent";
export type Approval = "venter" | "rediger" | "utforer" | "utfort" | "avvist" | "feilet";
export type CaddieState = "venter" | "bekreft" | "utfort" | "forkastet" | "ukjent";
export type PositionState = "ikke-forespurt" | "avvist" | "utilgjengelig" | "gammel";
export type OpsStep = "alarm" | "triage" | "kontroll" | "restore" | "resultat" | "kvittering";
export type PlayerMode = "amator" | "proff";

type Series = Record<string, number>;

type HqState = {
  sessionStatus: SessionStatus;
  shots: number;
  series: Series;
  save: SaveState;
  approval: Approval;
  moveTo: string;
  caddie: Record<string, CaddieState>;
  selectedPlayer: string;
  publishPlan: boolean;
  publishExec: boolean;
  publishSave: SaveState;
  inboxFilter: "alle" | "spiller" | "foresatt" | "system";
  position: PositionState;
  ops: OpsStep;
  opsHealth: "ok" | "degraded" | "429";
  goalDraft: string;
  noticeRead: Record<string, boolean>;
  playerMode: PlayerMode;
  yearPublished: boolean;
  seriesNote: string;
  fysLog: FysSetLog[];
  nextKg: number | null;
  startSession: () => void;
  pauseSession: () => void;
  addShot: () => void;
  addSerie: (id: string) => void;
  finishSession: () => void;
  setSave: (s: SaveState) => void;
  setApproval: (a: Approval) => void;
  setMoveTo: (t: string) => void;
  setCaddie: (id: string, s: CaddieState) => void;
  setPlayer: (id: string) => void;
  setPublish: (part: "plan" | "exec" | "save", value: boolean | SaveState) => void;
  setInboxFilter: (f: HqState["inboxFilter"]) => void;
  setPosition: (p: PositionState) => void;
  setOps: (s: OpsStep) => void;
  setOpsHealth: (h: HqState["opsHealth"]) => void;
  setGoalDraft: (v: string) => void;
  markNotice: (id: string) => void;
  resetLive: () => void;
  setPlayerMode: (m: PlayerMode) => void;
  publishYear: () => void;
  setSeriesNote: (n: string) => void;
  addFysSet: () => void;
  removeFysSet: (id: string) => void;
  setFysActual: (id: string, actualReps: number, kg: number) => void;
  setFysRir: (id: string, rir: number) => void;
};

const INITIAL_SERIES = { d1: 0, d2: 0, d3: 0 };
const INITIAL_FYS: FysSetLog[] = [
  { id: "s1", planReps: 4, actualReps: 4, kg: 100, rir: null },
  { id: "s2", planReps: 4, actualReps: 4, kg: 100, rir: null },
  { id: "s3", planReps: 4, actualReps: 4, kg: 100, rir: null },
  { id: "s4", planReps: 4, actualReps: 4, kg: 100, rir: null },
];

export const useHq = create<HqState>((set) => ({
  sessionStatus: "planlagt",
  shots: 0,
  series: { ...INITIAL_SERIES },
  save: "idle",
  approval: "venter",
  moveTo: "fre 18.09 · 15:00",
  caddie: { "CD-8401": "venter", "CD-8404": "venter", "CD-8390": "venter" },
  selectedPlayer: "mina",
  publishPlan: false,
  publishExec: false,
  publishSave: "idle",
  inboxFilter: "alle",
  position: "ikke-forespurt",
  ops: "alarm",
  opsHealth: "degraded",
  goalDraft: "",
  noticeRead: { v1: false, v2: true },
  playerMode: "proff",
  yearPublished: false,
  seriesNote: "",
  fysLog: INITIAL_FYS.map((s) => ({ ...s })),
  nextKg: null,
  startSession: () => set({ sessionStatus: "pagar", save: "idle" }),
  pauseSession: () => set({ sessionStatus: "pauset" }),
  addShot: () =>
    set((s) => {
      const shots = s.shots + 1;
      const sessionStatus: SessionStatus =
        shots >= 12 ? "delvis" : s.sessionStatus === "planlagt" ? "pagar" : s.sessionStatus;
      return { shots, sessionStatus, series: { ...s.series, d1: Math.min(shots, 12) } };
    }),
  addSerie: (id) =>
    set((s) => {
      const next = { ...s.series, [id]: (s.series[id] ?? 0) + 1 };
      const all = next.d2 >= 3 && next.d3 >= 2;
      return { series: next, sessionStatus: all ? "delvis" : "pagar" };
    }),
  finishSession: () => set({ sessionStatus: "gjennomfort", save: "lagret" }),
  setSave: (save) => set({ save }),
  setApproval: (approval) => set({ approval }),
  setMoveTo: (moveTo) => set({ moveTo, approval: "rediger" }),
  setCaddie: (id, state) => set((s) => ({ caddie: { ...s.caddie, [id]: state } })),
  setPlayer: (selectedPlayer) => set({ selectedPlayer }),
  setPublish: (part, value) => {
    if (part === "plan") set({ publishPlan: Boolean(value) });
    else if (part === "exec") set({ publishExec: Boolean(value) });
    else set({ publishSave: value as SaveState });
  },
  setInboxFilter: (inboxFilter) => set({ inboxFilter }),
  setPosition: (position) => set({ position }),
  setOps: (ops) => set({ ops }),
  setOpsHealth: (opsHealth) => set({ opsHealth }),
  setGoalDraft: (goalDraft) => set({ goalDraft }),
  markNotice: (id) => set((s) => ({ noticeRead: { ...s.noticeRead, [id]: true } })),
  resetLive: () =>
    set({
      sessionStatus: "planlagt",
      shots: 0,
      series: { ...INITIAL_SERIES },
      save: "idle",
      fysLog: INITIAL_FYS.map((s) => ({ ...s })),
      nextKg: null,
    }),
  setPlayerMode: (playerMode) => set({ playerMode }),
  publishYear: () => set({ yearPublished: true }),
  setSeriesNote: (seriesNote) => set({ seriesNote }),
  addFysSet: () =>
    set((s) => {
      const last = s.fysLog[s.fysLog.length - 1];
      return {
        fysLog: [
          ...s.fysLog,
          {
            id: `s${s.fysLog.length + 1}`,
            planReps: last?.planReps ?? 4,
            actualReps: last?.planReps ?? 4,
            kg: last?.kg ?? 100,
            rir: null,
          },
        ],
      };
    }),
  removeFysSet: (id) => set((s) => ({ fysLog: s.fysLog.filter((x) => x.id !== id) })),
  setFysActual: (id, actualReps, kg) =>
    set((s) => ({
      fysLog: s.fysLog.map((x) => (x.id === id ? { ...x, actualReps, kg } : x)),
    })),
  setFysRir: (id, rir) =>
    set((s) => ({
      fysLog: s.fysLog.map((x) => (x.id === id ? { ...x, rir } : x)),
      nextKg: rirSuggestion(s.fysLog.find((x) => x.id === id)?.kg ?? 100, rir),
    })),
}));
