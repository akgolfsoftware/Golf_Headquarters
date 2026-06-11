"use client";

/**
 * Visuell plan-bygger — port av `agencyos-app/screens-planbuilder.jsx`.
 * Gantt-bånd (12 mnd) · uke-chips · palett (dra blokker/drills) · 7-dagers raster.
 * Tildel-modal sender til spiller(e) via opprettPlanFraByggere.
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Copy,
  Plus,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import { opprettPlanFraByggere, type VisuellByggSession } from "./actions";

/* ── Konstanter (oversatt fra prototype) ── */

const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"] as const;

const PHASE = {
  base:  { bg: "rgba(0,88,64,0.26)",     edge: "#1F6B52", lbl: "GRUNN" },
  build: { bg: "rgba(0,88,64,0.44)",     edge: "#2E8B6B", lbl: "OPPBYGGING" },
  spec:  { bg: "rgba(0,88,64,0.62)",     edge: "#3BA87E", lbl: "SPESIFIKK" },
  comp:  { bg: "rgba(0,88,64,0.82)",     edge: "#52C79A", lbl: "KONKURRANSE" },
  trans: { bg: "rgba(245,244,238,0.07)", edge: "rgba(245,244,238,0.34)", lbl: "OVERGANG" },
} as const;

type PhaseKey = keyof typeof PHASE;
type AxKey = "fys" | "tek" | "slag" | "spill" | "turn";

const AX: Record<AxKey, { lbl: string; color: string; name: string }> = {
  fys:   { lbl: "FYS",   color: "#005840", name: "Fysisk" },
  tek:   { lbl: "TEK",   color: "#B8852A", name: "Teknisk" },
  slag:  { lbl: "SLAG",  color: "#2563EB", name: "Slag" },
  spill: { lbl: "SPILL", color: "#D1F843", name: "Spill" },
  turn:  { lbl: "TURN",  color: "#A32D2D", name: "Turnering" },
};
const AX_ORDER: AxKey[] = ["fys", "tek", "slag", "spill", "turn"];

const DOWS = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"] as const;

type Period = { id: string; name: string; type: PhaseKey; m0: number; m1: number; weeks: number[] };

function mkWeeks(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => start + i);
}

const PERIODS: Period[] = [
  { id: "p-base",  name: "Grunntrening",   type: "base",  m0: 0,  m1: 1,  weeks: mkWeeks(2, 7)  },
  { id: "p-build", name: "Oppbygging",     type: "build", m0: 2,  m1: 3,  weeks: mkWeeks(9, 8)  },
  { id: "p-spec",  name: "Spesifikk",      type: "spec",  m0: 4,  m1: 4,  weeks: [18, 19, 20, 21, 22] },
  { id: "p-comp",  name: "Konkurranse",    type: "comp",  m0: 5,  m1: 7,  weeks: mkWeeks(23, 6) },
  { id: "p-spec2", name: "Spesifikk II",   type: "spec",  m0: 8,  m1: 8,  weeks: mkWeeks(37, 4) },
  { id: "p-comp2", name: "Konkurranse II", type: "comp",  m0: 9,  m1: 9,  weeks: mkWeeks(41, 4) },
  { id: "p-trans", name: "Overgang",       type: "trans", m0: 10, m1: 11, weeks: mkWeeks(45, 8) },
];

type Session = { id: string; ax: AxKey; ttl: string; mins: number };
type DayMap = Record<number, Session[]>;
type WeeksState = Record<number, DayMap>;

let _sid = 1000;
const newSid = () => "s" + (++_sid);
const mk = (ax: AxKey, ttl: string, mins: number): Session => ({ id: newSid(), ax, ttl, mins });

/* Uke 22 (Srixon-uka) forhåndsfylt */
const SEED_WEEK_22: DayMap = {
  0: [mk("fys", "Morgenmobilitet", 30), mk("slag", "Lengdekontroll 50–80 m", 75)],
  1: [mk("tek", "Sekvens P4–P8", 60), mk("fys", "Rotasjonsstyrke + core", 45)],
  2: [mk("fys", "Aktiv oppvarming", 30), mk("slag", "Innspill 50–80 m · presisjon", 60), mk("spill", "9-hulls spillsimulering", 90)],
  3: [mk("fys", "Morgenmobilitet", 20), mk("tek", "Putt-konsistens 4 m", 60), mk("slag", "Fulle slag · matte → gress", 75)],
  4: [mk("turn", "Pre-shot rutine + range", 90)],
  5: [], 6: [],
};

const DRILLS = [
  { ax: "slag" as AxKey, ttl: "Lengdekontroll 50/65/80", mins: 45 },
  { ax: "slag" as AxKey, ttl: "Wedge-matrise 30–90 m", mins: 40 },
  { ax: "tek"  as AxKey, ttl: "P-posisjoner P4–P8", mins: 30 },
  { ax: "tek"  as AxKey, ttl: "Putt-gate 1,5 m", mins: 25 },
  { ax: "fys"  as AxKey, ttl: "Rotasjonsstyrke + core", mins: 40 },
  { ax: "fys"  as AxKey, ttl: "Speed-protokoll", mins: 30 },
  { ax: "spill" as AxKey, ttl: "9-hulls scoring-spill", mins: 90 },
  { ax: "turn" as AxKey, ttl: "Pre-shot rutine", mins: 20 },
];

const fmtDur = (mins: number) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return (h ? h + " t" : "") + (h && m ? " " : "") + (m ? m + " m" : (h ? "" : "0 m"));
};

const weekRange = (n: number) => {
  const monday = new Date(2026, 0, 1 + (n - 1) * 7);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const f = (d: Date) => d.getDate() + ". " + MONTHS[d.getMonth()];
  return f(monday) + "–" + f(sunday);
};

/* ── GanttBand ── */
function GanttBand({
  selId,
  onSelect,
  nowFrac,
}: {
  selId: string;
  onSelect: (id: string) => void;
  nowFrac: number;
}) {
  return (
    <div>
      {/* Måneds-header */}
      <div className="grid grid-cols-12 mb-1">
        {MONTHS.map((m, i) => (
          <span
            key={m}
            className={
              "font-mono text-[9px] uppercase tracking-[0.08em] py-1 px-0.5 " +
              (i === Math.floor(nowFrac)
                ? "text-accent font-bold"
                : "text-muted-foreground")
            }
          >
            {m}
          </span>
        ))}
      </div>

      {/* Periode-sporgruppe (relativ posisjonering for NÅ-streken) */}
      <div className="relative grid grid-cols-12 gap-1">
        {PERIODS.map((p) => {
          const ph = PHASE[p.type];
          const sel = p.id === selId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={
                "rounded-[6px] border-l-[3px] px-2.5 py-2 text-left transition-colors " +
                (sel
                  ? "ring-1 ring-accent"
                  : "hover:brightness-110")
              }
              style={{
                gridColumn: `${p.m0 + 1} / ${p.m1 + 2}`,
                background: ph.bg,
                borderLeftColor: sel ? "var(--accent)" : ph.edge,
              }}
            >
              <span className="block font-display text-[12px] font-semibold leading-none text-foreground">
                {p.name}
              </span>
              <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                {ph.lbl} · {p.weeks.length} uker
              </span>
            </button>
          );
        })}

        {/* NÅ-markør */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-accent/60"
          style={{ left: `${(nowFrac / 12) * 100}%` }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-accent px-1 font-mono text-[8px] font-bold text-accent-foreground">
            NÅ
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Palett ── */
type DragData =
  | { type: "axis"; ax: AxKey }
  | { type: "drill"; index: number };

function Palette({
  onPaletteDrag,
  onAddDrill,
  onQuickAdd,
}: {
  onPaletteDrag: (e: React.DragEvent, data: DragData) => void;
  onAddDrill: (d: (typeof DRILLS)[number]) => void;
  onQuickAdd: (di: number, sess: Session) => void;
}) {
  const [qt, setQt] = useState("");
  const [qm, setQm] = useState(60);
  const [qa, setQa] = useState<AxKey>("slag");
  const [qd, setQd] = useState(0);

  const submit = () => {
    const ttl = qt.trim() || AX[qa].name + "-økt";
    onQuickAdd(qd, mk(qa, ttl, qm));
    setQt("");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-4 self-start">
      {/* Dra inn økt */}
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        Dra inn økt
      </div>
      <div className="flex flex-col gap-1.5">
        {AX_ORDER.map((k) => (
          <div
            key={k}
            draggable
            className="flex cursor-grab items-center gap-2 rounded-lg border-l-[3px] border border-border/50 px-3 py-2 hover:bg-secondary select-none"
            style={{ borderLeftColor: AX[k].color }}
            onDragStart={(e) => onPaletteDrag(e, { type: "axis", ax: k })}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: AX[k].color }}
            />
            <span className="font-mono text-[11px] font-bold text-foreground">
              {AX[k].lbl}
            </span>
          </div>
        ))}
      </div>

      {/* Drill-bibliotek */}
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground mt-1">
        Drill-bibliotek
      </div>
      <div className="flex max-h-[200px] flex-col gap-1 overflow-y-auto">
        {DRILLS.map((d, i) => (
          <div
            key={i}
            draggable
            className="flex cursor-grab items-center justify-between rounded-lg border-l-[3px] border border-border/40 px-2.5 py-1.5 hover:bg-secondary select-none"
            style={{ borderLeftColor: AX[d.ax].color }}
            title="Klikk for å legge til · dra inn i uka"
            onDragStart={(e) => onPaletteDrag(e, { type: "drill", index: i })}
            onClick={() => onAddDrill(d)}
          >
            <span className="text-[11px] text-foreground">{d.ttl}</span>
            <span className="ml-2 shrink-0 font-mono text-[9px] text-muted-foreground">
              {AX[d.ax].lbl} · {d.mins} m
            </span>
          </div>
        ))}
      </div>

      {/* Hurtig-legg-til */}
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground mt-1">
        Hurtig-legg-til
      </div>
      <div className="flex flex-col gap-2">
        <input
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Øktnavn"
          value={qt}
          onChange={(e) => setQt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        <div className="grid grid-cols-3 gap-1.5">
          <select
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none"
            value={qa}
            onChange={(e) => setQa(e.target.value as AxKey)}
          >
            {AX_ORDER.map((k) => (
              <option key={k} value={k}>{AX[k].lbl}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none"
            value={qm}
            onChange={(e) => setQm(Number(e.target.value))}
          >
            {[20, 30, 45, 60, 75, 90].map((m) => (
              <option key={m} value={m}>{m} m</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none"
            value={qd}
            onChange={(e) => setQd(Number(e.target.value))}
          >
            {DOWS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={agBtnClass("secondary", "sm") + " w-full justify-center"}
          onClick={submit}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Legg til økt
        </button>
      </div>
    </div>
  );
}

/* ── WeekGrid ── */
function WeekGrid({
  dayMap,
  overDay,
  setOverDay,
  setDragSess,
  onDrop,
  onRemove,
}: {
  dayMap: DayMap;
  overDay: number | null;
  setOverDay: (d: number | null) => void;
  setDragSess: (v: { id: string; from: number } | null) => void;
  onDrop: (di: number) => void;
  onRemove: (di: number, id: string) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DOWS.map((dow, di) => {
        const sessions = dayMap[di] || [];
        const mins = sessions.reduce((a, s) => a + s.mins, 0);
        const isOver = overDay === di;
        return (
          <div
            key={dow}
            className={
              "flex min-h-[280px] flex-col rounded-lg border transition-colors " +
              (isOver ? "border-accent/50 bg-accent/5" : "border-border")
            }
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overDay !== di) setOverDay(di);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverDay(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(di);
              setOverDay(null);
            }}
          >
            {/* Dag-header */}
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
                {dow}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">
                {mins ? fmtDur(mins) : "—"}
              </span>
            </div>

            {/* Økt-liste */}
            <div className="flex flex-1 flex-col gap-1.5 px-2 py-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  draggable
                  className="group relative cursor-grab rounded-lg border border-border/50 border-l-[3px] px-2.5 py-2"
                  style={{ borderLeftColor: AX[s.ax].color }}
                  onDragStart={() => setDragSess({ id: s.id, from: di })}
                  onDragEnd={() => setDragSess(null)}
                >
                  <div
                    className="font-mono text-[9px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: AX[s.ax].color }}
                  >
                    {AX[s.ax].lbl}
                  </div>
                  <div className="font-display text-[11px] font-semibold leading-tight text-foreground">
                    {s.ttl}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground">
                    {s.mins} m
                  </div>
                  <button
                    type="button"
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-secondary hover:text-foreground group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onRemove(di, s.id); }}
                    aria-label="Fjern økt"
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="py-4 text-center text-[11px] text-muted-foreground/40">
                  Dra økt hit
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── AssignModal ── */
type Recipient = { id: string; name: string; sub: string };

function AssignModal({
  spillere,
  grupper,
  onClose,
  onConfirm,
}: {
  spillere: Recipient[];
  grupper: Recipient[];
  onClose: () => void;
  onConfirm: (ids: string[], mode: "group" | "player") => void;
}) {
  const [mode, setMode] = useState<"group" | "player">("player");
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const list = mode === "group" ? grupper : spillere;
  const toggle = (id: string) => setPicked((p) => ({ ...p, [id]: !p[id] }));
  const selected = Object.entries(picked)
    .filter(([, v]) => v)
    .map(([id]) => id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hode */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              TILDEL PLAN
            </div>
            <div className="mt-1 font-display text-[17px] font-bold text-foreground">
              Velg mottaker(e)
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
            onClick={onClose}
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Segmented control */}
          <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
            {(["player", "group"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={
                  "flex-1 rounded-md px-3 py-1.5 text-sm transition-colors " +
                  (mode === k
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
                onClick={() => { setMode(k); setPicked({}); }}
              >
                {k === "player" ? "Spiller" : "Gruppe"}
              </button>
            ))}
          </div>

          {/* Liste */}
          <div className="flex max-h-[52vh] flex-col gap-2 overflow-y-auto">
            {list.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Ingen {mode === "group" ? "grupper" : "spillere"} tilgjengelig.
              </p>
            )}
            {list.map((r) => {
              const sel = !!picked[r.id];
              return (
                <button
                  key={r.id}
                  type="button"
                  className={
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors " +
                    (sel
                      ? "border-accent bg-accent/10"
                      : "border-border hover:bg-secondary")
                  }
                  onClick={() => toggle(r.id)}
                >
                  <span className="text-muted-foreground">
                    {mode === "group" ? (
                      <Users className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <User className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-foreground">{r.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{r.sub}</span>
                  </span>
                  <span
                    className={
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 " +
                      (sel
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border")
                    }
                  >
                    {sel && <Check className="h-3 w-3" strokeWidth={2.5} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fot */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            className={agBtnClass("ghost")}
            onClick={onClose}
          >
            Avbryt
          </button>
          <button
            type="button"
            className={agBtnClass("primary") + (selected.length === 0 ? " opacity-50 cursor-not-allowed" : "")}
            disabled={selected.length === 0}
            onClick={() => onConfirm(selected, mode)}
          >
            <CheckCheck className="h-4 w-4" strokeWidth={1.8} />
            Tildel {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Hoved-komponent ── */
export type SpillerData = { id: string; name: string; hcp: number | null };
export type GruppeData = { id: string; name: string; memberCount: number };

export function PlanBuilderClient({
  spillere,
  grupper,
}: {
  spillere: SpillerData[];
  grupper: GruppeData[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [planName, setPlanName] = useState("Topping mot Srixon #2");
  const [selId, setSelId] = useState("p-spec");
  const [selWeek, setSelWeek] = useState(22);
  const [weeks, setWeeks] = useState<WeeksState>({ 22: SEED_WEEK_22 });
  const [overDay, setOverDay] = useState<number | null>(null);
  const [dragSess, setDragSess] = useState<{ id: string; from: number } | null>(null);
  const [modal, setModal] = useState<"assign" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dragData = useRef<DragData | null>(null);

  const period = PERIODS.find((p) => p.id === selId);

  // Sikre at valgt uke tilhører valgt periode
  const safePeriodWeek = (pid: string) => {
    const p = PERIODS.find((x) => x.id === pid);
    if (p && !p.weeks.includes(selWeek)) setSelWeek(p.weeks[0]);
    setSelId(pid);
  };

  const nowFrac = 5 + 11 / 30; // 11. juni 2026

  const dayMap: DayMap = weeks[selWeek] || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  const ensureWeek = (prev: WeeksState, wk: number): WeeksState =>
    prev[wk]
      ? prev
      : { ...prev, [wk]: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] } };

  const addSession = (di: number, sess: Session) => {
    setWeeks((prev) => {
      const base = ensureWeek(prev, selWeek);
      const wk = base[selWeek];
      return { ...base, [selWeek]: { ...wk, [di]: [...(wk[di] || []), sess] } };
    });
  };

  const removeSession = (di: number, id: string) => {
    setWeeks((prev) => {
      const wk = prev[selWeek];
      if (!wk) return prev;
      return { ...prev, [selWeek]: { ...wk, [di]: (wk[di] || []).filter((s) => s.id !== id) } };
    });
  };

  const moveSession = (toDi: number) => {
    if (!dragSess) return;
    setWeeks((prev) => {
      const wk = prev[selWeek];
      if (!wk || dragSess.from === toDi) return prev;
      let moved: Session | null = null;
      const fromArr = (wk[dragSess.from] || []).filter((s) => {
        if (s.id === dragSess.id) { moved = s; return false; }
        return true;
      });
      if (!moved) return prev;
      return { ...prev, [selWeek]: { ...wk, [dragSess.from]: fromArr, [toDi]: [...(wk[toDi] || []), moved as Session] } };
    });
    setDragSess(null);
  };

  const onPaletteDrag = (e: React.DragEvent, data: DragData) => {
    dragData.current = data;
    try {
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", data.type);
    } catch { /* Noen nettlesere tillater ikke setData i DragStart */ }
  };

  const handleDrop = (di: number) => {
    if (dragSess) { moveSession(di); dragData.current = null; return; }
    const d = dragData.current; dragData.current = null;
    if (!d) return;
    if (d.type === "axis") {
      addSession(di, mk(d.ax, AX[d.ax].name + "-økt", 60));
    } else if (d.type === "drill") {
      const dr = DRILLS[d.index];
      addSession(di, mk(dr.ax, dr.ttl, dr.mins));
    }
  };

  // Aggregater for valgt uke
  const allSess = AX_ORDER.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as Record<AxKey, number>);
  let totalMin = 0, totalCount = 0;
  Object.values(dayMap).forEach((arr) =>
    (arr || []).forEach((s) => { allSess[s.ax] += s.mins; totalMin += s.mins; totalCount++; }),
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAssign = (ids: string[], mode: "group" | "player") => {
    setModal(null);
    if (mode === "group") {
      showToast("Gruppe-tildeling kommer snart · lagret som utkast");
      return;
    }
    // Bygg sessions-liste fra alle uker
    const allSessions: VisuellByggSession[] = [];
    for (const [wkStr, dayObj] of Object.entries(weeks)) {
      const wkNum = Number(wkStr);
      for (const [diStr, sessArr] of Object.entries(dayObj)) {
        const di = Number(diStr);
        for (const s of sessArr) {
          allSessions.push({ ax: s.ax, ttl: s.ttl, mins: s.mins, weekNumber: wkNum, dayIndex: di });
        }
      }
    }
    startTransition(async () => {
      let lastPlanId: string | null = null;
      for (const spillerId of ids) {
        const res = await opprettPlanFraByggere({
          spillerId,
          navn: planName.trim() || "Ny sesongplan",
          sessions: allSessions,
        });
        if (res.ok) lastPlanId = res.planId;
      }
      if (lastPlanId) {
        router.push(`/admin/plans/${lastPlanId}`);
      } else {
        showToast("Kunne ikke opprette plan — sjekk at spiller er valgt");
      }
    });
  };

  // Mottakere til modalen
  const spillereListe: { id: string; name: string; sub: string }[] = spillere.map((s) => ({
    id: s.id,
    name: s.name,
    sub: `HCP ${s.hcp ?? "–"}`,
  }));
  const grupperListe: { id: string; name: string; sub: string }[] = grupper.map((g) => ({
    id: g.id,
    name: g.name,
    sub: `${g.memberCount} spiller${g.memberCount !== 1 ? "e" : ""}`,
  }));

  return (
    <AgPage>
      {/* Header */}
      <AgPageHead
        eyebrow="PLANLEGGE · PLAN-BYGGER"
        title="Bygg"
        italic="planen."
        lead="Sett opp året, periodisér, og fyll ukene med økter. Dra blokker fra paletten inn i rasteret."
        actions={
          <>
            <button
              type="button"
              className={agBtnClass("ghost")}
              onClick={() => router.push("/admin/plans")}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Planer
            </button>
            <button
              type="button"
              className={agBtnClass("secondary")}
              onClick={() => showToast("Lagret i Plan-maler · demo")}
            >
              <Copy className="h-4 w-4" strokeWidth={1.8} />
              Lagre som mal
            </button>
            <button
              type="button"
              className={agBtnClass("primary")}
              onClick={() => setModal("assign")}
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.8} />
              Tildel spiller/gruppe
            </button>
          </>
        }
      />

      {/* Plan-navn */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          PLANNAVN
        </span>
        <input
          className="flex-1 bg-transparent font-display text-[15px] font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
        />
        <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          SESONG 2026 · MAKROSYKLUS
        </span>
      </div>

      {/* 01 · Årsplan */}
      <div className="mb-3 mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        <span className="text-primary">01</span>
        {" "}Årsplan · periodisering
      </div>
      <div className="rounded-2xl border border-border bg-card px-5 py-4 mb-6">
        <GanttBand selId={selId} onSelect={safePeriodWeek} nowFrac={nowFrac} />
      </div>

      {/* 02 · Ukeplaner */}
      <div className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        <span className="text-primary">02</span>
        {" "}Ukeplaner — {period?.name ?? ""}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(period?.weeks ?? []).map((wk) => {
          const sel = wk === selWeek;
          return (
            <button
              key={wk}
              type="button"
              className={
                "rounded-lg border px-3 py-2 transition-colors " +
                (sel
                  ? "border-accent bg-accent/10"
                  : "border-border hover:bg-secondary")
              }
              onClick={() => setSelWeek(wk)}
            >
              <span className="block font-mono text-[11px] font-bold text-foreground">
                Uke {wk}
              </span>
              <span className="block font-mono text-[9px] text-muted-foreground">
                {weekRange(wk)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 03 · Bygg uka */}
      <div className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        <span className="text-primary">03</span>
        {" "}Bygg uka
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr" }}>
        {/* Palett */}
        <Palette
          onPaletteDrag={onPaletteDrag}
          onAddDrill={(d) => addSession(0, mk(d.ax, d.ttl, d.mins))}
          onQuickAdd={addSession}
        />

        {/* Uke-raster */}
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          {/* Hode */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-display text-[18px] font-bold text-foreground">
                Uke {selWeek}
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {weekRange(selWeek)}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="block font-mono text-[15px] font-bold text-foreground">
                  {fmtDur(totalMin)}
                </div>
                <div className="block font-mono text-[9px] text-muted-foreground">
                  {totalCount} økt{totalCount !== 1 ? "er" : ""}
                </div>
              </div>
              <div className="flex gap-3">
                {AX_ORDER.map((k) => (
                  <span key={k} className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground" title={AX[k].name}>
                    <span className="h-2 w-2 rounded-full" style={{ background: AX[k].color }} />
                    {Math.round(allSess[k] / 60 * 10) / 10} t
                  </span>
                ))}
              </div>
            </div>
          </div>

          <WeekGrid
            dayMap={dayMap}
            overDay={overDay}
            setOverDay={setOverDay}
            setDragSess={setDragSess}
            onDrop={handleDrop}
            onRemove={removeSession}
          />
        </div>
      </div>

      {/* Tildel-modal */}
      {modal === "assign" && (
        <AssignModal
          spillere={spillereListe}
          grupper={grupperListe}
          onClose={() => setModal(null)}
          onConfirm={handleAssign}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-border bg-card px-4 py-3 shadow-2xl">
          <span className="font-display text-sm text-foreground">{toast}</span>
        </div>
      )}

      {/* Pending-overlay */}
      {pending && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded-xl border border-border bg-card px-6 py-4">
            <span className="font-mono text-sm text-muted-foreground">Oppretter plan…</span>
          </div>
        </div>
      )}
    </AgPage>
  );
}
