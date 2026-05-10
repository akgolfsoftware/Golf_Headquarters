"use client";

import { useEffect, useReducer, useTransition } from "react";
import Link from "next/link";
import type {
  TrainingPlanSession,
  SessionDrill,
  ExerciseDefinition,
  PyramidArea,
} from "@/generated/prisma/client";
import { DrillProgress } from "@/components/portal/drill-progress";
import { CsRating } from "@/components/portal/cs-rating";
import { startSession, completeSession } from "./actions";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

type DrillMedDef = SessionDrill & { exercise: ExerciseDefinition };

type Phase = "intro" | "active" | "drillDone" | "summary";

type State = {
  phase: Phase;
  drillIndex: number;
  startedAt: string | null;
  results: Record<string, { csAchieved?: number; notes?: string }>;
  csInput: number;
  notesInput: string;
  ratingInput: number;
  finalNotesInput: string;
};

type Action =
  | { type: "START" }
  | { type: "SET_CS"; value: number }
  | { type: "SET_NOTES"; value: string }
  | { type: "SET_RATING"; value: number }
  | { type: "SET_FINAL_NOTES"; value: string }
  | { type: "LOG_DRILL" }
  | { type: "NEXT_DRILL"; total: number }
  | { type: "FINISH_DRILLS" }
  | { type: "BACK_TO_ACTIVE" };

const initialState: State = {
  phase: "intro",
  drillIndex: 0,
  startedAt: null,
  results: {},
  csInput: 70,
  notesInput: "",
  ratingInput: 4,
  finalNotesInput: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, phase: "active", startedAt: new Date().toISOString() };
    case "SET_CS":
      return { ...state, csInput: action.value };
    case "SET_NOTES":
      return { ...state, notesInput: action.value };
    case "SET_RATING":
      return { ...state, ratingInput: action.value };
    case "SET_FINAL_NOTES":
      return { ...state, finalNotesInput: action.value };
    case "LOG_DRILL":
      return { ...state, phase: "drillDone" };
    case "NEXT_DRILL": {
      const idx = state.drillIndex;
      return {
        ...state,
        phase: idx + 1 >= action.total ? "summary" : "active",
        drillIndex: idx + 1,
        csInput: 70,
        notesInput: "",
        results: {},
      };
    }
    case "FINISH_DRILLS":
      return { ...state, phase: "summary" };
    case "BACK_TO_ACTIVE":
      return { ...state, phase: "active" };
    default:
      return state;
  }
}

export function LiveTapper({
  session,
  drills,
}: {
  session: TrainingPlanSession;
  drills: DrillMedDef[];
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, startTransition] = useTransition();

  // Tastatur-snarveier (space = neste, esc = avbryt)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (state.phase === "intro") {
          startTransition(async () => {
            await startSession(session.id);
            dispatch({ type: "START" });
          });
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, session.id]);

  function handleStart() {
    startTransition(async () => {
      await startSession(session.id);
      dispatch({ type: "START" });
    });
  }

  function handleLogDrill() {
    dispatch({ type: "LOG_DRILL" });
  }

  function handleNextDrill() {
    dispatch({ type: "NEXT_DRILL", total: drills.length });
  }

  function handleComplete() {
    if (!state.startedAt) return;
    startTransition(async () => {
      await completeSession({
        sessionId: session.id,
        startedAt: state.startedAt!,
        csAchieved: state.csInput,
        notes: state.finalNotesInput || undefined,
        rating: state.ratingInput,
      });
    });
  }

  if (drills.length === 0) {
    return (
      <Tom>
        <h1 className="font-display text-3xl font-semibold">Ingen drills</h1>
        <p className="mt-2 text-muted-foreground">
          Denne økten har ikke fått tildelt drills ennå. Be coach om å legge dem til.
        </p>
        <Link
          href="/portal/tren"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Tilbake til plan
        </Link>
      </Tom>
    );
  }

  if (state.phase === "intro") {
    return (
      <Wrapper>
        <Eyebrow>Klar til økt</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          {session.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {PYR_LABEL[session.pyramidArea]} · {session.durationMin} min · {drills.length} drills
        </p>
        {session.rationale && (
          <p className="mt-6 max-w-xl text-sm text-foreground">
            {session.rationale}
          </p>
        )}

        <ul className="mt-8 max-w-xl space-y-2 text-left text-sm text-muted-foreground">
          {drills.map((d, i) => (
            <li key={d.id} className="flex gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground">{d.exercise.name}</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {d.repsSets}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={pending}
            className="rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Starter…" : "Start økt"}
          </button>
          <Link
            href="/portal/tren"
            className="rounded-md border border-input bg-card px-8 py-4 text-base font-medium text-foreground hover:border-border"
          >
            Avbryt
          </Link>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Tips: trykk mellomromstast for å starte
        </p>
      </Wrapper>
    );
  }

  const drill = drills[state.drillIndex];

  if (state.phase === "active") {
    return (
      <Wrapper>
        <DrillProgress current={state.drillIndex} total={drills.length} />

        <Eyebrow>Drill {state.drillIndex + 1}</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {drill.exercise.name}
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.10em] text-muted-foreground">
          {drill.repsSets}
          {drill.csTarget && ` · CS ${drill.csTarget}`} · L-fase {drill.exercise.lPhase}
        </p>

        {drill.exercise.description && (
          <p className="mt-6 max-w-xl text-sm text-foreground">
            {drill.exercise.description}
          </p>
        )}
        {drill.notes && (
          <p className="mt-3 max-w-xl rounded-md border-l-2 border-primary bg-primary/5 px-4 py-2 text-sm text-foreground">
            {drill.notes}
          </p>
        )}

        <div className="mt-8 max-w-md">
          <CsRating
            value={state.csInput}
            onChange={(v) => dispatch({ type: "SET_CS", value: v })}
          />
        </div>

        <div className="mt-6 max-w-md">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Notat (valgfritt)
          </label>
          <textarea
            value={state.notesInput}
            onChange={(e) => dispatch({ type: "SET_NOTES", value: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleLogDrill}
            className="rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Lagre drill →
          </button>
        </div>
      </Wrapper>
    );
  }

  if (state.phase === "drillDone") {
    const erSiste = state.drillIndex + 1 >= drills.length;
    return (
      <Wrapper>
        <Eyebrow>Drill fullført</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          <em className="font-normal text-primary md:italic">Bra jobba!</em>
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {drill.exercise.name} · CS {state.csInput}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {erSiste ? (
            <button
              type="button"
              onClick={() => dispatch({ type: "FINISH_DRILLS" })}
              className="rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Avslutt økt →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextDrill}
              className="rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Neste drill →
            </button>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: "BACK_TO_ACTIVE" })}
            className="rounded-md border border-input bg-card px-8 py-4 text-base font-medium text-foreground hover:border-border"
          >
            Endre logging
          </button>
        </div>
      </Wrapper>
    );
  }

  // summary
  return (
    <Wrapper>
      <Eyebrow>Økt fullført</Eyebrow>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        <em className="font-normal text-primary md:italic">Godt jobbet!</em>
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Du fullførte alle {drills.length} drills på {session.title}.
      </p>

      <div className="mt-10 max-w-md space-y-6">
        <CsRating
          value={state.csInput}
          onChange={(v) => dispatch({ type: "SET_CS", value: v })}
          label="Total CS-følelse"
        />

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Vurdering
          </span>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => dispatch({ type: "SET_RATING", value: n })}
                className={`flex-1 rounded-md border px-3 py-3 text-sm font-medium transition-colors ${
                  state.ratingInput === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:border-border"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Tøff</span>
            <span>God flyt</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Notat for økten
          </label>
          <textarea
            value={state.finalNotesInput}
            onChange={(e) =>
              dispatch({ type: "SET_FINAL_NOTES", value: e.target.value })
            }
            rows={3}
            placeholder="Hva fungerte godt? Hva må jobbes med?"
            className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <button
          type="button"
          onClick={handleComplete}
          disabled={pending}
          className="rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Lagrer…" : "Lagre og gå til plan"}
        </button>
      </div>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-start justify-start p-8 md:p-16">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
}

function Tom({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}
