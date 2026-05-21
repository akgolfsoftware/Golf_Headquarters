"use client";

// Client-komponent for Live Session Logger.
// Speiler iPhone 1 fra public/design/live-session-logger/index.html.
// Bruker hele viewporten (mobil-først) — ingen iPhone-frame.

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Layers,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addDrill,
  addSet as addSetAction,
  completeSet,
  finishSession,
  logRep,
  saveDrillNote,
} from "./actions";
import type {
  LiveDrill,
  LiveDrillSet,
  LiveSessionData,
} from "./page";

type Props = {
  data: LiveSessionData;
};

const disciplineStyles: Record<
  LiveDrill["discipline"],
  { bg: string; color: string; label: string }
> = {
  SLAG: { bg: "bg-[#2C7D52]/15", color: "text-[#1f5e3d]", label: "SLAG" },
  TEK: { bg: "bg-primary/15", color: "text-primary", label: "TEK" },
  FYS: { bg: "bg-[#1A4D2E]/15", color: "text-[#1A4D2E]", label: "FYS" },
};

export function LiveActiveClient({ data }: Props) {
  const router = useRouter();
  const [drills, setDrills] = useState<LiveDrill[]>(data.drills);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [isFinishing, startFinishTransition] = useTransition();

  const totalReps = useMemo(() => {
    const logged = drills.reduce(
      (acc, d) =>
        acc + d.sets.reduce((s, set) => s + (set.done ? set.reps ?? 0 : 0), 0),
      0,
    );
    // Hold visning konsistent med dummy-data fra prototypen hvis ingenting er endret.
    return logged > 0 ? logged : data.totalReps;
  }, [drills, data.totalReps]);

  // Best-effort wrapper for server actions. Aktive økt-IDer i dummy-data er
  // ikke ekte Prisma-rader, så feil tolereres stille (vi viser inline-toast).
  // Når data hentes fra DB, vil disse kallene faktisk persistere.
  function callAction<R>(fn: () => Promise<{ error: string } | { success: true; data?: R }>) {
    startTransition(async () => {
      try {
        const result = await fn();
        if (result && "error" in result && result.error) {
          setPendingError(result.error);
          window.setTimeout(() => setPendingError(null), 3000);
        }
      } catch {
        // stille feil under utvikling
      }
    });
  }

  function toggleSetDone(drillId: string, setId: string) {
    setDrills((prev) =>
      prev.map((d) => {
        if (d.id !== drillId) return d;
        const sets = d.sets.map((s) => {
          if (s.id !== setId) return s;
          const becomesDone = !s.done;
          const reps = becomesDone && s.reps == null ? s.forrigeReps : s.reps;
          return { ...s, done: becomesDone, reps };
        });
        const completedSets = sets.filter((s) => s.done).length;
        return { ...d, sets, completedSets };
      }),
    );
    // 17. completeSet — markér sett ferdig på server.
    callAction(() => completeSet({ setId }));
  }

  function updateSetReps(drillId: string, setId: string, value: string) {
    const parsed = value === "" ? null : Number.parseInt(value, 10);
    setDrills((prev) =>
      prev.map((d) => {
        if (d.id !== drillId) return d;
        const sets = d.sets.map((s) =>
          s.id === setId
            ? {
                ...s,
                reps: Number.isFinite(parsed as number)
                  ? (parsed as number)
                  : null,
              }
            : s,
        );
        return { ...d, sets };
      }),
    );
  }

  function addRepsToActiveSet(drillId: string, delta: number) {
    let activeSetId: string | null = null;
    setDrills((prev) =>
      prev.map((d) => {
        if (d.id !== drillId) return d;
        // Aktiv = første sett som ikke er done.
        const activeIndex = d.sets.findIndex((s) => !s.done);
        if (activeIndex === -1) return d;
        const sets = d.sets.map((s, i) => {
          if (i !== activeIndex) return s;
          activeSetId = s.id;
          return { ...s, reps: (s.reps ?? 0) + delta };
        });
        return { ...d, sets };
      }),
    );
    // 16. logRep — legg til reps på server.
    if (activeSetId) {
      const setId = activeSetId;
      callAction(() => logRep({ setId, addReps: delta }));
    }
  }

  function toggleExpanded(drillId: string) {
    setDrills((prev) =>
      prev.map((d) =>
        d.id === drillId ? { ...d, expanded: !d.expanded } : d,
      ),
    );
  }

  function addSet(drillId: string) {
    setDrills((prev) =>
      prev.map((d) => {
        if (d.id !== drillId) return d;
        const newSet: LiveDrillSet = {
          id: `${drillId}-${d.sets.length + 1}`,
          forrigeReps: 10,
          forrigeFase: d.fase,
          reps: null,
          done: false,
        };
        return {
          ...d,
          sets: [...d.sets, newSet],
          totalSets: d.totalSets + 1,
        };
      }),
    );
    // 18. addSet — opprett sett på server.
    callAction(() => addSetAction({ drillInstanceId: drillId }));
  }

  function handleAddDrill() {
    // 19. addDrill — legg til drill mid-økt.
    callAction(() =>
      addDrill({
        sessionId: data.sessionId,
        drillName: "Ny drill",
        pyramidArea: "TEK",
      }),
    );
  }

  function handleSaveNote(
    drillId: string,
    type: "SELF" | "COACH_QUESTION" | "VIDEO",
    content: string,
  ) {
    // 20. saveDrillNote — notat til seg selv / coach / video.
    if (!content.trim() && type !== "VIDEO") return;
    callAction(() =>
      saveDrillNote({
        drillInstanceId: drillId,
        type,
        content: type === "VIDEO" ? undefined : content,
        videoUrl: type === "VIDEO" ? "vercel-blob://placeholder" : undefined,
      }),
    );
  }

  function handleFinishSession() {
    // 21. finishSession — avslutt økt + notifiser coach.
    startFinishTransition(async () => {
      const result = await finishSession({ sessionId: data.sessionId });
      if ("error" in result) {
        setPendingError(result.error);
        window.setTimeout(() => setPendingError(null), 3000);
        return;
      }
      router.push(`/portal/live/${data.sessionId}/summary`);
    });
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="h-14 px-4 flex items-center justify-between gap-3 border-b border-border bg-background sticky top-0 z-10">
        <button
          type="button"
          aria-label="Tilbake"
          className="w-11 h-11 flex items-center justify-center rounded-full border border-border bg-card text-foreground"
        >
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
        <div className="flex-1 flex flex-col items-center leading-tight text-center">
          <strong className="font-display text-[15px] font-semibold tracking-[-0.01em]">
            Log økt
          </strong>
          <small className="font-mono text-[9px] font-medium tracking-[0.1em] uppercase text-muted-foreground mt-[3px]">
            {data.ukedag} · {data.fase} · {data.varighetMin} min
          </small>
        </div>
        <button
          type="button"
          onClick={handleFinishSession}
          disabled={isFinishing}
          className="bg-accent text-foreground rounded-full px-4 py-[9px] font-semibold text-[13px] inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          <X className="w-[13px] h-[13px]" strokeWidth={2} />
          {isFinishing ? "Avslutter…" : "Avslutt"}
        </button>
      </header>

      {pendingError ? (
        <div
          role="alert"
          className="mx-4 mt-2 rounded-lg border border-destructive/35 bg-destructive/10 text-destructive px-3 py-2 text-[12px]"
        >
          {pendingError}
        </div>
      ) : null}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-background border-b border-border">
        <StatCard
          live
          label="Varighet"
          value={data.varighetTekst}
          unit="MIN"
          icon={<Clock className="w-[11px] h-[11px]" strokeWidth={2} />}
        />
        <StatCard
          label="Reps"
          value={String(totalReps)}
          unit="tot"
          icon={<Activity className="w-[11px] h-[11px]" strokeWidth={2} />}
        />
        <StatCard
          label="Drills"
          value={String(data.completedDrills)}
          unit={`/ ${data.totalDrills}`}
          icon={<CheckCircle2 className="w-[11px] h-[11px]" strokeWidth={2} />}
        />
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {drills.map((d) => (
          <DrillCard
            key={d.id}
            drill={d}
            onToggleSet={(setId) => toggleSetDone(d.id, setId)}
            onSetReps={(setId, value) => updateSetReps(d.id, setId, value)}
            onShortcut={(delta) => addRepsToActiveSet(d.id, delta)}
            onToggleExpanded={() => toggleExpanded(d.id)}
            onAddSet={() => addSet(d.id)}
            onSaveNote={(type, content) => handleSaveNote(d.id, type, content)}
          />
        ))}

        <button
          type="button"
          onClick={handleAddDrill}
          className="m-4 mb-6 w-[calc(100%-32px)] py-3 border border-dashed border-primary/40 text-primary rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5"
        >
          <Plus className="w-[14px] h-[14px]" strokeWidth={2} />
          Legg til drill
        </button>
      </div>
    </div>
  );
}

// ---------- Subkomponenter ----------

function StatCard({
  label,
  value,
  unit,
  icon,
  live = false,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 flex flex-col gap-1",
        live
          ? "bg-primary border-primary text-white"
          : "bg-card border-border",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 font-mono text-[8.5px] font-semibold tracking-[0.1em] uppercase",
          live ? "text-white/70" : "text-muted-foreground",
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={cn(
          "font-mono text-[15px] font-semibold tracking-[-0.02em]",
          live ? "text-accent" : "text-foreground",
        )}
      >
        {value}
        {unit ? (
          <span
            className={cn(
              "text-[10px] ml-0.5 font-medium",
              live ? "text-accent/70" : "text-muted-foreground",
            )}
          >
            {" "}
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DrillCard({
  drill,
  onToggleSet,
  onSetReps,
  onShortcut,
  onToggleExpanded,
  onAddSet,
  onSaveNote,
}: {
  drill: LiveDrill;
  onToggleSet: (setId: string) => void;
  onSetReps: (setId: string, value: string) => void;
  onShortcut: (delta: number) => void;
  onToggleExpanded: () => void;
  onAddSet: () => void;
  onSaveNote: (
    type: "SELF" | "COACH_QUESTION" | "VIDEO",
    content: string,
  ) => void;
}) {
  const isActive = drill.expanded;
  const styles = disciplineStyles[drill.discipline];
  const progressPct =
    drill.totalSets > 0
      ? Math.round((drill.completedSets / drill.totalSets) * 100)
      : 0;

  return (
    <article className="bg-card border-b border-border">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto] gap-2.5 items-center px-3.5 pt-4 pb-3">
        <div>
          <div className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-1">
            Drill {drill.index} av {drill.total}
            {isActive ? " · Aktiv" : ""}
          </div>
          <div className="font-display text-base font-semibold tracking-[-0.015em] leading-tight text-foreground mb-2.5">
            {drill.name}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Pill className={cn(styles.bg, styles.color)}>
              <span className="w-2 h-2 rounded-full bg-current inline-block" />
              {styles.label}
            </Pill>
            {drill.ghostPills.map((p) => (
              <Pill
                key={p}
                className="bg-background border border-border text-muted-foreground"
              >
                {p}
              </Pill>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label={isActive ? "Skjul" : "Utvid"}
          onClick={onToggleExpanded}
          className={cn(
            "w-[34px] h-[34px] rounded-full flex items-center justify-center border flex-shrink-0",
            isActive
              ? "bg-primary text-accent border-primary"
              : "bg-background text-muted-foreground border-border",
          )}
        >
          {isActive ? (
            <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2.5 px-3.5 pb-3.5">
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="font-mono text-[10px] font-semibold text-foreground tracking-[0.04em] whitespace-nowrap">
          <span className="text-muted-foreground">SETT</span>{" "}
          {drill.completedSets} / {drill.totalSets}
        </span>
      </div>

      {isActive ? (
        <ActiveBody
          drill={drill}
          onToggleSet={onToggleSet}
          onSetReps={onSetReps}
          onShortcut={onShortcut}
          onAddSet={onAddSet}
          onSaveNote={onSaveNote}
        />
      ) : null}
    </article>
  );
}

function ActiveBody({
  drill,
  onToggleSet,
  onSetReps,
  onShortcut,
  onAddSet,
  onSaveNote,
}: {
  drill: LiveDrill;
  onToggleSet: (setId: string) => void;
  onSetReps: (setId: string, value: string) => void;
  onShortcut: (delta: number) => void;
  onAddSet: () => void;
  onSaveNote: (
    type: "SELF" | "COACH_QUESTION" | "VIDEO",
    content: string,
  ) => void;
}) {
  const activeIdx = drill.sets.findIndex((s) => !s.done);

  return (
    <>
      {/* Detail strip */}
      <div className="px-3.5 pb-3.5 flex gap-1.5 flex-wrap">
        <DetailPill icon={<Layers className="w-2.5 h-2.5" strokeWidth={2} />}>
          {drill.format}
        </DetailPill>
        <DetailPill icon={<MapPin className="w-2.5 h-2.5" strokeWidth={2} />}>
          <span className="text-muted-foreground font-medium">Område:</span>{" "}
          {drill.omrade}
        </DetailPill>
        <DetailPill
          icon={<TrendingUp className="w-2.5 h-2.5" strokeWidth={2} />}
        >
          <span className="text-muted-foreground font-medium">Fase:</span>{" "}
          {drill.fase}
        </DetailPill>
        <DetailPill
          icon={<SlidersHorizontal className="w-2.5 h-2.5" strokeWidth={2} />}
        >
          <span className="text-muted-foreground font-medium">Belastn:</span>{" "}
          {drill.belastning}
        </DetailPill>
        <DetailPill icon={<Target className="w-2.5 h-2.5" strokeWidth={2} />}>
          <span className="text-muted-foreground font-medium">Mål:</span>{" "}
          {drill.malProsent}%
        </DetailPill>
      </div>

      {/* Rest timer */}
      <div className="mx-3.5 mb-4 rounded-2xl p-3.5 grid grid-cols-[1fr_auto] items-center gap-2.5 relative overflow-hidden bg-gradient-to-br from-[#00604a] to-[#003e2c] text-white">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] uppercase text-accent/70 mb-1">
            <Clock className="w-2.5 h-2.5" strokeWidth={2} />
            Rest timer · løper
          </div>
          <div className="font-mono text-[30px] font-semibold tracking-[-0.02em] leading-none flex items-baseline gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full self-center animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
            02:14
            <span className="text-sm text-white/50 ml-1">/ 03:00</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            className="bg-accent text-foreground rounded-full px-3.5 py-1.5 font-semibold text-[11px] min-w-[76px]"
          >
            Pause
          </button>
          <button
            type="button"
            className="bg-transparent text-white border border-white/30 rounded-full px-3.5 py-1.5 font-semibold text-[11px] min-w-[76px]"
          >
            Hopp over
          </button>
        </div>
        <span className="absolute inset-0 rounded-2xl border border-accent/15 pointer-events-none" />
      </div>

      {/* Sets table */}
      <div className="mx-3.5 mb-3.5 border border-border rounded-xl overflow-hidden bg-card">
        <div className="grid grid-cols-[36px_1fr_78px_44px] px-3 py-2.5 bg-background border-b border-border font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-muted-foreground items-center">
          <span className="text-center">Sett</span>
          <span>Forrige</span>
          <span className="text-center">Reps</span>
          <span className="text-center">✓</span>
        </div>
        {drill.sets.map((s, i) => (
          <SetRow
            key={s.id}
            set={s}
            index={i + 1}
            isActive={i === activeIdx}
            onToggle={() => onToggleSet(s.id)}
            onChangeReps={(v) => onSetReps(s.id, v)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="w-[calc(100%-28px)] mx-3.5 mb-4 py-2.5 bg-transparent border border-dashed border-primary/40 text-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
      >
        <Plus className="w-[13px] h-[13px]" strokeWidth={2} />
        Legg til sett
      </button>

      {/* Shortcuts */}
      <div className="grid grid-cols-5 gap-1.5 px-3.5 py-3 mb-4 bg-background border-y border-border relative">
        <span className="absolute -top-2 left-3.5 bg-background px-1.5 font-mono text-[8px] font-semibold tracking-[0.15em] text-muted-foreground">
          REP-SHORTCUTS
        </span>
        {[1, 5, 10, 25].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onShortcut(n)}
            className="h-12 rounded-xl bg-accent text-foreground font-mono text-sm font-bold tracking-[-0.02em] flex items-center justify-center shadow-[0_1px_0_rgba(0,0,0,0.05)]"
          >
            +{n}
          </button>
        ))}
        <button
          type="button"
          className="h-12 rounded-xl bg-primary text-accent font-mono text-sm font-bold tracking-[-0.02em] flex items-center justify-center relative shadow-[0_1px_0_rgba(0,0,0,0.05)]"
        >
          1+1
          <ArrowUpRight
            className="absolute top-1.5 right-1.5 w-[9px] h-[9px] opacity-70"
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* Notes */}
      <div className="px-3.5 pb-4 flex flex-col gap-2">
        <div className="font-mono text-[9px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mt-1 mb-0.5">
          Notater til denne drillen
        </div>

        <NoteRow
          icon={<Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />}
          label="Notat til meg selv"
          placeholder="Hva la jeg merke til?"
          onSave={(text) => onSaveNote("SELF", text)}
        />
        <NoteRow
          icon={<MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />}
          label="Spørsmål til Anders"
          placeholder="Hva bør coach svare på?"
          onSave={(text) => onSaveNote("COACH_QUESTION", text)}
        />
        <NoteRow
          icon={<Video className="w-3.5 h-3.5" strokeWidth={1.75} />}
          label="Send video til Anders"
          placeholder="Tap for å ta opp eller velg fra galleri"
          dashed
          onSave={() => onSaveNote("VIDEO", "")}
        />
      </div>
    </>
  );
}

function SetRow({
  set,
  index,
  isActive,
  onToggle,
  onChangeReps,
}: {
  set: LiveDrillSet;
  index: number;
  isActive: boolean;
  onToggle: () => void;
  onChangeReps: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[36px_1fr_78px_44px] px-3 py-2.5 items-center border-b border-border last:border-b-0 relative",
        set.done && "bg-accent/10",
        isActive && "bg-accent/15",
      )}
    >
      {isActive ? (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />
      ) : null}
      <span
        className={cn(
          "font-mono text-sm font-semibold text-center",
          isActive ? "text-primary" : "text-foreground",
        )}
      >
        {index}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground tracking-[0.02em]">
        <span className="text-foreground font-semibold">{set.forrigeReps}</span>{" "}
        reps · {set.forrigeFase}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={set.reps ?? ""}
        onChange={(e) => onChangeReps(e.target.value)}
        placeholder="—"
        readOnly={set.done}
        className={cn(
          "w-[70px] h-9 mx-auto block border border-border rounded-lg bg-background font-mono text-base font-semibold text-center text-foreground tracking-[-0.02em] outline-none placeholder:text-border",
          set.done && "bg-card",
          isActive && "border-primary border-2 bg-card",
        )}
      />
      <button
        type="button"
        aria-label={set.done ? "Fullført" : "Logg sett"}
        onClick={onToggle}
        className={cn(
          "w-8 h-8 mx-auto rounded-full border-[1.5px] flex items-center justify-center",
          set.done
            ? "bg-accent border-accent text-foreground"
            : "bg-card border-border text-border",
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={set.done ? 2.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] bg-[#2A6FDB] rounded-full flex items-center justify-center text-white shadow-[0_0_0_4px_rgba(42,111,219,0.18)] animate-pulse"
        >
          <ChevronRight className="w-[11px] h-[11px]" strokeWidth={3} />
        </span>
      ) : null}
    </div>
  );
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

function DetailPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-full font-mono text-[9px] font-semibold tracking-[0.05em] uppercase text-foreground whitespace-nowrap">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </span>
  );
}

function NoteRow({
  icon,
  label,
  placeholder,
  dashed = false,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  dashed?: boolean;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    if (dashed) {
      // Video-rad — kall save uten innhold (action stubber video-URL).
      onSave("");
      return;
    }
    if (text.trim()) {
      onSave(text.trim());
      setText("");
    }
    setEditing(false);
  };

  return (
    <div
      onClick={() => {
        if (!editing && !dashed) setEditing(true);
        if (dashed) handleSave();
      }}
      className={cn(
        "grid grid-cols-[32px_1fr] gap-2.5 px-3 py-2.5 rounded-xl items-center cursor-text",
        dashed
          ? "border border-dashed border-primary/40 bg-accent/5"
          : "bg-background border border-border",
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-xs text-foreground mb-0.5">
          {label}
        </div>
        {editing ? (
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setText("");
                setEditing(false);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-[11px] text-foreground p-0 font-sans"
          />
        ) : (
          <div className="text-[11px] text-muted-foreground">
            {text || placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
