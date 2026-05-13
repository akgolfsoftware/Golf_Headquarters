"use client";

import { useEffect, useMemo, useReducer, useRef, useTransition } from "react";
import Link from "next/link";
import {
  X,
  Pause,
  Check,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlignJustify,
  Trophy,
  LineChart,
  Pencil,
  SmilePlus,
  Meh,
  Frown,
  Home,
  SkipForward,
} from "lucide-react";
import type {
  TrainingPlanSession,
  SessionDrill,
  ExerciseDefinition,
  PyramidArea,
} from "@/generated/prisma/client";
import { startSession, completeSession } from "./actions";

// =============================================================================
// Typer og konstanter
// =============================================================================

type DrillMedDef = SessionDrill & { exercise: ExerciseDefinition };

type Phase = "intro" | "active" | "between" | "summary";

type DrillResult = {
  drillId: string;
  repsLogged: number;
  repsTarget: number;
  approved: number;
  failed: number;
  bestStreak: number;
};

type State = {
  phase: Phase;
  drillIndex: number;
  startedAt: string | null;
  repsLogged: number;
  approved: number;
  failed: number;
  currentStreak: number;
  bestStreak: number;
  results: DrillResult[];
  feedbackMood: "good" | "ok" | "tough" | null;
  feedbackNote: string;
};

type Action =
  | { type: "START" }
  | { type: "LOG_REP"; ok: boolean }
  | { type: "COMPLETE_DRILL"; target: number }
  | { type: "START_NEXT_DRILL" }
  | { type: "FINISH_SESSION" }
  | { type: "SET_MOOD"; value: "good" | "ok" | "tough" }
  | { type: "SET_FEEDBACK_NOTE"; value: string };

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

// Pyramide-farger fra globals.css (--color-pyr-*). Fallback bevart for unike
// nyanser brukt tidligere i denne flaten dersom CSS-variablene mangler.
const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys, #4A6B5C)",
  TEK: "var(--color-pyr-tek, #D1F843)",
  SLAG: "var(--color-pyr-slag, #7BC4A0)",
  SPILL: "var(--color-pyr-spill, #3F8B6A)",
  TURN: "var(--color-pyr-turn, #2A4636)",
};

const initialState: State = {
  phase: "intro",
  drillIndex: 0,
  startedAt: null,
  repsLogged: 0,
  approved: 0,
  failed: 0,
  currentStreak: 0,
  bestStreak: 0,
  results: [],
  feedbackMood: null,
  feedbackNote: "",
};

// =============================================================================
// Helpers
// =============================================================================

// Parse "30 reps" / "3x10" / "25 putts" → tall (default 20)
function parseTargetReps(repsSets: string | null | undefined): number {
  if (!repsSets) return 20;
  const s = repsSets.toLowerCase();
  // Format "3x10" eller "3 x 10"
  const multi = s.match(/(\d+)\s*[x×]\s*(\d+)/);
  if (multi) {
    return parseInt(multi[1], 10) * parseInt(multi[2], 10);
  }
  // Bare første tall
  const single = s.match(/\d+/);
  if (single) return parseInt(single[0], 10);
  return 20;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, phase: "active", startedAt: new Date().toISOString() };

    case "LOG_REP": {
      const newApproved = state.approved + (action.ok ? 1 : 0);
      const newFailed = state.failed + (action.ok ? 0 : 1);
      const newStreak = action.ok ? state.currentStreak + 1 : 0;
      const newBest = Math.max(state.bestStreak, newStreak);
      return {
        ...state,
        repsLogged: state.repsLogged + 1,
        approved: newApproved,
        failed: newFailed,
        currentStreak: newStreak,
        bestStreak: newBest,
      };
    }

    case "COMPLETE_DRILL": {
      // Lagre nåværende drill-resultat
      // (drillId settes i komponent siden vi ikke har den her)
      return {
        ...state,
        phase: "between",
      };
    }

    case "START_NEXT_DRILL":
      return {
        ...state,
        phase: "active",
        drillIndex: state.drillIndex + 1,
        repsLogged: 0,
        approved: 0,
        failed: 0,
        currentStreak: 0,
        bestStreak: 0,
      };

    case "FINISH_SESSION":
      return { ...state, phase: "summary" };

    case "SET_MOOD":
      return { ...state, feedbackMood: action.value };

    case "SET_FEEDBACK_NOTE":
      return { ...state, feedbackNote: action.value };

    default:
      return state;
  }
}

// =============================================================================
// Hovedkomponent
// =============================================================================

export function LiveTapper({
  session,
  drills,
}: {
  session: TrainingPlanSession;
  drills: DrillMedDef[];
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, startTransition] = useTransition();

  // Lagre drill-resultater når vi går fra active → between
  // (Vi gjør det her ved hjelp av ref siden reducer-en ikke har drillId tilgjengelig)
  const resultsRef = useRef<DrillResult[]>([]);

  const currentDrill = drills[state.drillIndex];
  const targetReps = useMemo(
    () => parseTargetReps(currentDrill?.repsSets),
    [currentDrill?.repsSets],
  );
  const isLastDrill = state.drillIndex >= drills.length - 1;

  // Tastatur-snarveier
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ignorer hvis fokus i textarea/input
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (state.phase === "intro") {
          handleStart();
        } else if (state.phase === "active") {
          handleLogRep(true);
        }
      } else if (e.key === "Enter") {
        if (state.phase === "between") {
          if (isLastDrill) handleFinishSession();
          else handleStartNextDrill();
        }
      } else if (e.key === "x" || e.key === "X") {
        if (state.phase === "active") handleLogRep(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, isLastDrill]);

  // Auto-fullfør drill når mål nås
  useEffect(() => {
    if (state.phase === "active" && state.repsLogged >= targetReps && targetReps > 0) {
      // Liten delay for visuell feedback
      const t = setTimeout(() => handleCompleteDrill(), 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.repsLogged, state.phase, targetReps]);

  function handleStart() {
    startTransition(async () => {
      await startSession(session.id);
      dispatch({ type: "START" });
    });
  }

  function handleLogRep(ok: boolean) {
    dispatch({ type: "LOG_REP", ok });
  }

  function handleCompleteDrill() {
    if (!currentDrill) return;
    // Lagre resultat i ref
    resultsRef.current = [
      ...resultsRef.current,
      {
        drillId: currentDrill.id,
        repsLogged: state.repsLogged,
        repsTarget: targetReps,
        approved: state.approved,
        failed: state.failed,
        bestStreak: state.bestStreak,
      },
    ];
    dispatch({ type: "COMPLETE_DRILL", target: targetReps });
  }

  function handleStartNextDrill() {
    dispatch({ type: "START_NEXT_DRILL" });
  }

  function handleFinishSession() {
    dispatch({ type: "FINISH_SESSION" });
  }

  function handleSaveAndExit() {
    if (!state.startedAt) return;
    // Bygg notat fra resultater + feedback
    const totalReps = resultsRef.current.reduce((s, r) => s + r.repsLogged, 0);
    const totalApproved = resultsRef.current.reduce((s, r) => s + r.approved, 0);
    const approvalPct =
      totalReps > 0 ? Math.round((totalApproved / totalReps) * 100) : 0;
    const moodLabel =
      state.feedbackMood === "good"
        ? "God økt"
        : state.feedbackMood === "ok"
          ? "Grei økt"
          : state.feedbackMood === "tough"
            ? "Tøff økt"
            : null;
    const notesParts: string[] = [];
    if (moodLabel) notesParts.push(moodLabel);
    if (state.feedbackNote.trim()) notesParts.push(state.feedbackNote.trim());

    const rating =
      state.feedbackMood === "good"
        ? 5
        : state.feedbackMood === "ok"
          ? 3
          : state.feedbackMood === "tough"
            ? 2
            : 4;

    startTransition(async () => {
      await completeSession({
        sessionId: session.id,
        startedAt: state.startedAt!,
        csAchieved: approvalPct,
        notes: notesParts.length ? notesParts.join(" — ") : undefined,
        rating,
      });
    });
  }

  // ===========================================================================
  // Tom-state
  // ===========================================================================

  if (drills.length === 0) {
    return (
      <div className="flex min-h-screen min-h-dvh flex-col items-center justify-center bg-foreground p-8 text-center text-white">
        <h1 className="font-display text-3xl font-semibold italic">Ingen drills</h1>
        <p className="mt-2 text-white/65">
          Denne økten har ikke fått tildelt drills ennå. Be coach om å legge dem til.
        </p>
        <Link
          href="/portal/tren"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Tilbake til plan
        </Link>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 1 — INTRO
  // ===========================================================================

  if (state.phase === "intro") {
    return (
      <div className="relative grid h-screen h-[100dvh] w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-foreground text-white">
        <RadialAccent />

        <TopBar
          left={
            <>
              <LivePill label="Klar" muted />
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
                {PYR_LABEL[session.pyramidArea]} · {drills.length} øvelser
              </span>
            </>
          }
          center={
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55 tabular-nums">
              {session.durationMin} min · {drills.length} drills
            </span>
          }
          right={<CloseButton />}
        />

        <section className="relative z-[1] mx-auto flex w-full max-w-[1100px] flex-col items-center justify-center px-8 pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Klar til økt
          </div>

          <h1 className="mx-auto mt-6 max-w-[900px] text-center font-display text-[28px] sm:text-[40px] md:text-[56px] italic leading-[1.1] tracking-[-0.02em] text-white">
            <em className="italic">{session.title}</em>
          </h1>

          {session.rationale && (
            <p className="mx-auto mt-4 max-w-[680px] text-center text-[15px] leading-[1.55] text-white/65">
              {session.rationale}
            </p>
          )}

          <ul className="mt-10 grid w-full max-w-[720px] gap-2.5">
            {drills.map((d, i) => (
              <li
                key={d.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[15px] font-semibold text-white">
                    {d.exercise.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-white/55">
                    {PYR_LABEL[d.exercise.pyramidArea]} · L-fase {d.exercise.lPhase}
                  </div>
                </div>
                <span className="font-mono text-[12px] tabular-nums text-white/65">
                  {d.repsSets}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <BottomBar>
          <Link
            href="/portal/tren"
            className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent px-8 text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]"
          >
            Avbryt
          </Link>
          <button
            type="button"
            onClick={handleStart}
            disabled={pending}
            className="inline-flex h-[72px] flex-1 items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-accent-foreground transition-transform hover:bg-accent/90 active:scale-[0.99] disabled:opacity-60"
            style={{
              boxShadow:
                "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
            }}
          >
            {pending ? "Starter…" : "Start økt"}
            <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2} />
            <span className="ml-2 inline-flex items-center rounded-md border border-accent-foreground/25 bg-accent-foreground/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-accent-foreground">
              space
            </span>
          </button>
        </BottomBar>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 2 — ACTIVE (rep-logging)
  // ===========================================================================

  if (state.phase === "active" && currentDrill) {
    const ringRadius = 228;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const progress = targetReps > 0 ? Math.min(state.repsLogged / targetReps, 1) : 0;
    const dashOffset = ringCircumference * (1 - progress);
    const pyrColor = PYR_COLOR[currentDrill.exercise.pyramidArea];

    return (
      <div className="relative grid h-screen h-[100dvh] w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-foreground text-white">
        <RadialAccent />

        <TopBar
          left={
            <>
              <LivePill label="Live" />
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
                Øvelse {state.drillIndex + 1} av {drills.length} ·{" "}
                {PYR_LABEL[currentDrill.exercise.pyramidArea]}
              </span>
            </>
          }
          center={
            <ProgressDots total={drills.length} current={state.drillIndex} />
          }
          right={<CloseButton />}
        />

        <div className="relative z-[1] flex flex-col items-center justify-center">
          {/* Klubb-pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-primary/70 bg-primary/10 px-4 py-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: pyrColor }}
            />
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-white/95">
              {PYR_LABEL[currentDrill.exercise.pyramidArea]} ·{" "}
              {currentDrill.exercise.name}
            </span>
          </div>

          {/* Counter ring */}
          <div className="relative mt-8 flex aspect-square w-full max-w-[480px] items-center justify-center px-4 sm:px-0">
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 480 480"
            >
              <circle
                cx="240"
                cy="240"
                r={ringRadius}
                fill="none"
                strokeWidth="4"
                stroke="rgba(255,255,255,0.08)"
              />
              <circle
                cx="240"
                cy="240"
                r={ringRadius}
                fill="none"
                strokeWidth="4"
                stroke="var(--accent)"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={dashOffset}
                style={{
                  filter: "drop-shadow(0 0 10px rgba(209,248,67,0.35))",
                  transition: "stroke-dashoffset 200ms ease-out",
                }}
              />
            </svg>

            <div className="flex flex-col items-center">
              <div
                className="font-mono text-[200px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-accent"
                style={{ textShadow: "0 0 32px rgba(209,248,67,0.30)" }}
              >
                {state.repsLogged}
              </div>
              <div className="mt-3 font-mono text-[14px] font-medium uppercase tracking-[0.16em] text-white/55">
                av {targetReps} reps
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-8 flex items-stretch gap-8">
            <MiniStat label="Godkjent" value={state.approved} highlight />
            <Divider />
            <MiniStat label="Mislykket" value={state.failed} dim />
            <Divider />
            <MiniStat label="Streak" value={state.currentStreak} />
          </div>
        </div>

        <BottomBar cols="grid-cols-[200px_200px_1fr]">
          <button
            type="button"
            onClick={handleCompleteDrill}
            className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-transparent text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.04]"
          >
            <SkipForward className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Hopp over
          </button>
          <button
            type="button"
            onClick={() => handleLogRep(false)}
            className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]"
          >
            <Pause className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Bom (X)
          </button>
          <button
            type="button"
            onClick={() => handleLogRep(true)}
            className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-accent-foreground transition-transform hover:bg-accent/90 active:scale-[0.99]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
            }}
          >
            <Check className="h-[22px] w-[22px]" strokeWidth={2} />
            Logg rep
            <span className="ml-2 inline-flex items-center rounded-md border border-accent-foreground/25 bg-accent-foreground/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-accent-foreground">
              space
            </span>
          </button>
        </BottomBar>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 3 — BETWEEN (overgang)
  // ===========================================================================

  if (state.phase === "between" && currentDrill) {
    const last = resultsRef.current[resultsRef.current.length - 1];
    const approvalPct =
      last && last.repsLogged > 0
        ? Math.round((last.approved / last.repsLogged) * 100)
        : 0;
    const lastNextDrill = isLastDrill ? null : drills[state.drillIndex + 1];

    return (
      <div className="relative grid h-screen h-[100dvh] w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-foreground text-white">
        <TopBar
          left={
            <>
              <LivePill label="Mellom" />
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
                Øvelse {state.drillIndex + 1} av {drills.length} fullført
              </span>
            </>
          }
          center={
            <ProgressDots
              total={drills.length}
              current={state.drillIndex}
              completed
            />
          }
          right={<CloseButton />}
        />

        <section className="relative z-[1] mx-auto flex w-full max-w-[1280px] items-center px-16 py-12">
          <div className="grid w-full max-w-[1120px] grid-cols-[1.1fr_1fr] items-center gap-16">
            {/* LEFT — done summary */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={1.5} />
                Fullført
              </div>

              <h1 className="mt-5 font-display text-[28px] sm:text-[40px] md:text-[56px] font-semibold italic leading-[1.05] tracking-[-0.025em] text-white">
                <em className="italic">{currentDrill.exercise.name}</em>
              </h1>
              <p className="mt-2 font-mono text-[13px] tracking-[0.04em] text-white/65">
                {last?.repsLogged ?? 0} reps logget · {approvalPct} % godkjent
              </p>

              <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
                <StatCard label="Reps" value={String(last?.repsLogged ?? 0)} />
                <StatCard
                  label="Godkjent"
                  value={String(last?.approved ?? 0)}
                  highlight
                  sub={`${approvalPct} %`}
                />
                <StatCard
                  label="Beste streak"
                  value={String(last?.bestStreak ?? 0)}
                />
              </div>
            </div>

            {/* RIGHT — neste øvelse */}
            <div>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                {isLastDrill ? "Klar til oppsummering" : "Neste øvelse"}
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-7">
                {isLastDrill ? (
                  <div className="flex items-center gap-6">
                    <div className="inline-flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                      <Trophy
                        className="h-12 w-12 text-accent"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="mb-1 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
                        Alle øvelser ferdig
                      </h2>
                      <p className="text-[14px] leading-[1.5] text-white/65">
                        Se hvordan økten gikk og send feedback til coach.
                      </p>
                    </div>
                  </div>
                ) : (
                  lastNextDrill && (
                    <div className="flex items-center gap-6">
                      <div
                        className="inline-flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full font-mono text-[14px] font-semibold uppercase tracking-[0.16em] text-white/85"
                        style={{
                          background: PYR_COLOR[lastNextDrill.exercise.pyramidArea],
                          opacity: 0.85,
                        }}
                      >
                        {lastNextDrill.exercise.pyramidArea}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                          <span className="h-2 w-2 rounded-sm bg-accent" />
                          {PYR_LABEL[lastNextDrill.exercise.pyramidArea]}
                        </div>
                        <h2 className="mb-1 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
                          {lastNextDrill.exercise.name}
                        </h2>
                        <p className="text-[14px] leading-[1.5] text-white/65">
                          {lastNextDrill.repsSets}
                          {lastNextDrill.exercise.description
                            ? ` · ${lastNextDrill.exercise.description.slice(0, 80)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )
                )}

                {!isLastDrill && lastNextDrill && (
                  <>
                    <div className="my-6 h-px bg-white/10" />
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                          Reps-mål
                        </div>
                        <div className="font-mono text-[15px] text-white tabular-nums">
                          {parseTargetReps(lastNextDrill.repsSets)}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                          L-fase
                        </div>
                        <div className="font-mono text-[15px] text-white">
                          {lastNextDrill.exercise.lPhase}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                          CS-mål
                        </div>
                        <div className="font-mono text-[15px] text-white tabular-nums">
                          {lastNextDrill.csTarget ?? "—"}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-white/55">
                <Clock className="h-[13px] w-[13px]" strokeWidth={1.5} />
                Ta deg en kort pause
              </div>
            </div>
          </div>
        </section>

        <BottomBar cols="grid-cols-[220px_1fr]">
          <Link
            href="/portal/tren"
            className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-transparent text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.04]"
          >
            <AlignJustify className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Avslutt økt
          </Link>

          <button
            type="button"
            onClick={isLastDrill ? handleFinishSession : handleStartNextDrill}
            className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-accent-foreground transition-transform hover:bg-accent/90 active:scale-[0.99]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
            }}
          >
            {isLastDrill ? "Se oppsummering" : "Start neste øvelse"}
            <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2} />
            <span className="ml-2 inline-flex items-center rounded-md border border-accent-foreground/25 bg-accent-foreground/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-accent-foreground">
              enter
            </span>
          </button>
        </BottomBar>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 4 — SUMMARY
  // ===========================================================================

  const totalReps = resultsRef.current.reduce((s, r) => s + r.repsLogged, 0);
  const totalApproved = resultsRef.current.reduce((s, r) => s + r.approved, 0);
  const approvalPct =
    totalReps > 0 ? Math.round((totalApproved / totalReps) * 100) : 0;
  const bestStreakOverall = resultsRef.current.reduce(
    (m, r) => Math.max(m, r.bestStreak),
    0,
  );

  // Bygg pyramide-fordeling fra resultater
  const pyramidDist = (() => {
    const dist: Record<PyramidArea, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    resultsRef.current.forEach((r) => {
      const drill = drills.find((d) => d.id === r.drillId);
      if (drill) dist[drill.exercise.pyramidArea] += r.repsLogged;
    });
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    return (Object.keys(dist) as PyramidArea[]).map((k) => ({
      key: k,
      label: k,
      pct: total > 0 ? Math.round((dist[k] / total) * 100) : 0,
      color: PYR_COLOR[k],
    }));
  })();

  const donutRadius = 80;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;

  const drillsFullført = resultsRef.current.length;

  return (
    <div className="relative min-h-screen min-h-dvh w-screen grid-rows-[56px_1fr_104px] overflow-y-auto bg-foreground text-white md:grid md:h-screen md:h-[100dvh] md:overflow-hidden">
      <TopBar
        left={
          <>
            <LivePill label="Ferdig" muted />
            <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
              Økt fullført
            </span>
          </>
        }
        center={
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55 tabular-nums">
            {session.title} · {drillsFullført} av {drills.length} øvelser
          </span>
        }
        right={<CloseButton />}
      />

      <section className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col px-8 pt-12 pb-8 md:px-16">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            <Trophy className="h-[14px] w-[14px]" strokeWidth={1.5} />
            Økt fullført
          </div>
          <h1 className="mx-auto max-w-[880px] font-display text-[28px] sm:text-[40px] md:text-[56px] italic leading-[1.15] text-white">
            <em className="italic">
              {drillsFullført} av {drills.length} øvelser.
            </em>{" "}
            Bra jobba.
          </h1>
          <p className="mt-4 font-mono text-[13px] tracking-[0.08em] text-white/65 tabular-nums">
            {totalReps} reps totalt · {totalApproved} godkjent · {approvalPct} %
          </p>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-[360px_1fr]">
          {/* Donut */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Pyramide-fordeling
            </div>

            <div className="mb-6 flex justify-center">
              <svg viewBox="0 0 200 200" width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r={donutRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="22"
                />
                {pyramidDist
                  .filter((w) => w.pct > 0)
                  .map((w) => {
                    const length = (w.pct / 100) * donutCircumference;
                    const current = donutOffset;
                    donutOffset -= length;
                    return (
                      <circle
                        key={w.key}
                        cx="100"
                        cy="100"
                        r={donutRadius}
                        fill="none"
                        stroke={w.color}
                        strokeWidth="22"
                        strokeDasharray={`${length} ${donutCircumference}`}
                        strokeDashoffset={current}
                        transform="rotate(-90 100 100)"
                      />
                    );
                  })}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {pyramidDist.map((w) => (
                <div key={w.key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      background: w.color,
                      opacity: w.pct === 0 ? 0.4 : 1,
                    }}
                  />
                  <span className="font-mono text-[11px] tracking-[0.04em] text-white/65">
                    {w.label}
                  </span>
                  <span
                    className={`ml-auto font-mono text-[11px] tabular-nums ${
                      w.pct === 0 ? "text-white/45" : "text-white"
                    }`}
                  >
                    {w.pct} %
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryStat
              label="Reps totalt"
              value={totalReps}
              sub={`fordelt på ${drillsFullført} øvelser`}
            />
            <SummaryStat
              label="Godkjent"
              value={totalApproved}
              sub={`${approvalPct} % treff`}
              highlight
            />
            <SummaryStat
              label="Beste streak"
              value={bestStreakOverall}
              sub="reps på rad"
            />
            <SummaryStat
              label="Øvelser"
              value={drillsFullført}
              sub={`av ${drills.length} planlagt`}
            />
          </div>
        </div>

        {/* Feedback */}
        <div className="mt-6 flex flex-wrap items-center gap-5 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-mono text-[14px] font-semibold text-white">
              AK
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold text-white">
                Send rask feedback til coach
              </div>
              <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-white/55">
                Hvordan opplevde du økten?
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex gap-2">
            <MoodButton
              icon={<SmilePlus className="h-[22px] w-[22px]" strokeWidth={1.5} />}
              active={state.feedbackMood === "good"}
              onClick={() => dispatch({ type: "SET_MOOD", value: "good" })}
              label="Bra økt"
            />
            <MoodButton
              icon={<Meh className="h-[22px] w-[22px]" strokeWidth={1.5} />}
              active={state.feedbackMood === "ok"}
              onClick={() => dispatch({ type: "SET_MOOD", value: "ok" })}
              label="Helt grei"
            />
            <MoodButton
              icon={<Frown className="h-[22px] w-[22px]" strokeWidth={1.5} />}
              active={state.feedbackMood === "tough"}
              onClick={() => dispatch({ type: "SET_MOOD", value: "tough" })}
              label="Tøff økt"
            />
          </div>

          <div className="relative">
            <Pencil
              className="pointer-events-none absolute left-4 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-white/55"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={state.feedbackNote}
              onChange={(e) =>
                dispatch({ type: "SET_FEEDBACK_NOTE", value: e.target.value })
              }
              placeholder="Skriv kommentar (valgfritt)"
              className="h-11 w-[280px] rounded-full border border-white/15 bg-transparent pl-10 pr-4 font-display text-[13px] text-white placeholder:text-white/45 outline-none transition-colors focus:border-white/30"
            />
          </div>
        </div>
      </section>

      <BottomBar cols="grid-cols-[280px_1fr]">
        <Link
          href={`/portal/tren/${session.id}`}
          className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]"
        >
          <LineChart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Detaljert post-økt
        </Link>
        <button
          type="button"
          onClick={handleSaveAndExit}
          disabled={pending}
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-accent-foreground transition-transform hover:bg-accent/90 active:scale-[0.99] disabled:opacity-60"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          {pending ? "Lagrer…" : "Lagre og avslutt"}
          <Home className="h-[22px] w-[22px]" strokeWidth={2} />
        </button>
      </BottomBar>
    </div>
  );
}

// =============================================================================
// Sub-komponenter (lokale)
// =============================================================================

function RadialAccent() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: 760,
        height: 760,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(209,248,67,0.06) 0%, rgba(209,248,67,0) 65%)",
      }}
    />
  );
}

function TopBar({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center justify-center">{center}</div>
      <div className="flex items-center justify-end gap-4">{right}</div>
    </header>
  );
}

function BottomBar({
  children,
  cols = "grid-cols-[200px_1fr]",
}: {
  children: React.ReactNode;
  cols?: string;
}) {
  return (
    <div
      className={`relative z-10 grid ${cols} items-center gap-4 border-t border-white/[0.06] px-6 py-4`}
    >
      {children}
    </div>
  );
}

function LivePill({ label, muted = false }: { label: string; muted?: boolean }) {
  if (muted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-white/60" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-white/65">
          {label}
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5">
      <span className="relative h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(209,248,67,0.18)]" />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-accent">
        {label}
      </span>
    </div>
  );
}

function CloseButton() {
  return (
    <Link
      href="/portal/tren"
      aria-label="Lukk"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
    >
      <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
    </Link>
  );
}

function ProgressDots({
  total,
  current,
  completed = false,
}: {
  total: number;
  current: number;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          if (i < current) {
            return (
              <span
                key={i}
                className="h-1.5 w-6 rounded-full bg-white/60"
              />
            );
          }
          if (i === current && !completed) {
            return (
              <span
                key={i}
                className="h-1.5 w-6 rounded-full bg-accent shadow-[0_0_0_3px_rgba(209,248,67,0.18)]"
              />
            );
          }
          if (i === current && completed) {
            return (
              <span
                key={i}
                className="h-1.5 w-6 rounded-full bg-accent shadow-[0_0_0_3px_rgba(209,248,67,0.18)]"
              />
            );
          }
          return (
            <span key={i} className="h-1.5 w-6 rounded-full bg-white/15" />
          );
        })}
      </div>
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
        {String(current + (completed ? 1 : 1)).padStart(2, "0")} /{" "}
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight = false,
  dim = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-[22px] font-medium tabular-nums ${
          highlight ? "text-accent" : dim ? "text-white/60" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-white/10" />;
}

function StatCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[28px] font-medium tabular-nums ${
          highlight ? "text-accent" : "text-white"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 font-mono text-[11px] tracking-[0.04em] text-white/55">
          {sub}
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums ${
          highlight ? "text-accent" : "text-white"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 font-mono text-[12px] text-white/55">{sub}</div>
      )}
    </div>
  );
}

function MoodButton({
  icon,
  active,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
        active
          ? "border-accent bg-accent/20 text-accent"
          : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {icon}
    </button>
  );
}
