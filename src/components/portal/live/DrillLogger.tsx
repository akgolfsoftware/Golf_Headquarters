import { Check, Target } from "lucide-react";
import type { LiveV2Drill, DrillRepState } from "./types";
import { RepCounter } from "./RepCounter";

export type DrillLoggerProps = {
  drill: LiveV2Drill;
  state: DrillRepState;
  onChange: (state: DrillRepState) => void;
  onComplete: () => void;
  /** Er dette siste drill? Styrer CTA-tekst. */
  isLast: boolean;
  /** Viser fremdrift. */
  completedCount: number;
  totalCount: number;
};

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const L_PHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
};

const AXIS_DOT: Record<string, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

export function DrillLogger({
  drill,
  state,
  onChange,
  onComplete,
  isLast,
  completedCount,
  totalCount,
}: DrillLoggerProps) {
  const computedTotal =
    state.repsWithoutBall + state.repsLowSpeed + state.repsAutomatic + state.repsHit;

  const setField = <K extends keyof DrillRepState>(key: K, value: number) => {
    if (key === "repsTotal") {
      onChange({ ...state, repsTotal: Math.max(0, value) });
      return;
    }
    const next = { ...state, [key]: Math.max(0, value) } as DrillRepState;
    next.repsTotal = next.repsWithoutBall + next.repsLowSpeed + next.repsAutomatic + next.repsHit;
    onChange(next);
  };

  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const axisDot = AXIS_DOT[drill.pyramide] ?? "bg-accent";

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Drillinfo-kort */}
      <div className="rounded-2xl border border-background/10 bg-background/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 items-center gap-2 rounded-md border border-background/15 px-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-background/90">
                <span className={`h-2 w-2 rounded-full ${axisDot}`} aria-hidden />
                {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
              </span>
              {drill.lFase && (
                <span className="inline-flex h-6 items-center rounded-md border border-background/15 px-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-background/70">
                  {L_PHASE_LABEL[drill.lFase] ?? drill.lFase}
                </span>
              )}
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.1] -tracking-[0.02em] text-background">
              {drill.name}
            </h2>
            {drill.description && (
              <p className="mt-2 text-sm leading-relaxed text-background/70">
                {drill.description}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-background/15 bg-background/5">
            <Target className="h-5 w-5 text-accent" strokeWidth={2} aria-hidden />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-sm font-semibold tabular-nums text-background/65">
          <span>{drill.durationMinutes} min</span>
          <span className="text-background/30">·</span>
          <span>{drill.plannedReps > 0 ? `${drill.plannedReps} reps mål` : "Ingen reps-mål"}</span>
        </div>

        {drill.notes && (
          <div className="mt-4 rounded-lg border border-background/10 bg-foreground/40 px-4 py-2 text-sm leading-relaxed text-background/75">
            {drill.notes}
          </div>
        )}

        {/* Fremdriftslinje */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/55">
            <span>Drills fullført</span>
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rep-tellere */}
      <RepCounter
        label="Totalt"
        value={computedTotal}
        primary
        hideDecrement
        readOnly
      />

      <div className="grid gap-4">
        <RepCounter
          label="Uten ball"
          value={state.repsWithoutBall}
          onChange={(v) => setField("repsWithoutBall", v)}
        />
        <RepCounter
          label="Lav hastighet"
          value={state.repsLowSpeed}
          onChange={(v) => setField("repsLowSpeed", v)}
        />
        <RepCounter
          label="Automatikk"
          value={state.repsAutomatic}
          onChange={(v) => setField("repsAutomatic", v)}
        />
        <RepCounter
          label="Golfballer slått"
          value={state.repsHit}
          onChange={(v) => setField("repsHit", v)}
        />
      </div>

      {/* Fullfør-knapp */}
      <button
        type="button"
        onClick={onComplete}
        className="mt-2 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-base font-extrabold uppercase tracking-[0.06em] text-foreground active:scale-[0.98]"
        style={{ boxShadow: "0 4px 18px rgba(209, 248, 67, 0.28)" }}
      >
        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        {isLast ? "Fullfør økt" : "Fullfør drill"}
      </button>
    </div>
  );
}
