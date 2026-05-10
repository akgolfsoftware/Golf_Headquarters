import type { ExerciseDefinition, PyramidArea, LPhase } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 text-pyr-fys",
  TEK: "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
};

const LPHASE_LABEL: Record<LPhase, string> = {
  KROPP: "Kropp",
  ARM: "Arm",
  KOLLE: "Kølle",
  BALL: "Ball",
  AUTO: "Auto",
};

export function ExerciseCard({ exercise }: { exercise: ExerciseDefinition }) {
  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold leading-tight text-foreground">
          {exercise.name}
        </h3>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
            PYR_BG[exercise.pyramidArea]
          }`}
        >
          {PYR_LABEL[exercise.pyramidArea]}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {LPHASE_LABEL[exercise.lPhase]}
        </span>
      </div>

      {exercise.description && (
        <p className="mt-3 text-sm text-muted-foreground">{exercise.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        {exercise.defaultRepsSets && <span>{exercise.defaultRepsSets}</span>}
        {(exercise.csMin != null || exercise.csMax != null) && (
          <span>
            CS{" "}
            {exercise.csMin ?? "?"}
            {exercise.csMax != null ? `–${exercise.csMax}` : ""}
          </span>
        )}
        {exercise.videoUrl && <span className="text-primary">▷ video</span>}
      </div>
    </article>
  );
}
