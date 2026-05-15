"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { ExerciseDefinition, PyramidArea, LPhase } from "@/generated/prisma/client";
import { getDrillModus, DrillParametersSchema } from "@/lib/taxonomy";

export const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk", TEK: "Teknisk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 text-pyr-fys",
  TEK: "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
};

const LPHASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunnperiode", SPESIAL: "Spesialiseringsperiode", TURNERING: "Turneringsperiode",
};

export function ExerciseCard({
  exercise,
  href,
  actions,
}: {
  exercise: ExerciseDefinition;
  href?: string;
  actions?: React.ReactNode;
}) {
  const modus = getDrillModus(exercise.pyramidArea);
  const params = exercise.parametersJson ? DrillParametersSchema.safeParse(exercise.parametersJson) : null;
  const fysType = params?.success && params.data.modus === "FYS" ? params.data.fysType : null;

  const content = (
    <article className="flex h-full cursor-pointer flex-col rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold leading-tight text-foreground">
          {exercise.name}
        </h3>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${PYR_BG[exercise.pyramidArea]}`}>
          {PYR_LABEL[exercise.pyramidArea]}
        </span>
        {exercise.lPhase && (
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {LPHASE_LABEL[exercise.lPhase]}
          </span>
        )}
        {fysType && (
          <span className="rounded-full bg-pyr-fys/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-pyr-fys">
            {fysType}
          </span>
        )}
      </div>

      {exercise.description && (
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {exercise.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
        {exercise.defaultRepsSets && <span>{exercise.defaultRepsSets}</span>}
        {(exercise.csMin != null || exercise.csMax != null) && (
          <span>
            CS {exercise.csMin ?? "?"}{exercise.csMax != null ? `–${exercise.csMax}` : ""}
          </span>
        )}
        {exercise.durationMin != null && <span>{exercise.durationMin} min</span>}
        {exercise.videoUrl && (
          <span className="flex items-center gap-1 text-primary">
            <Play className="h-3 w-3" strokeWidth={2} />
            video
          </span>
        )}
        {modus === "FYS" && !fysType && (
          <span className="text-pyr-fys">FYS</span>
        )}
      </div>
    </article>
  );

  const target = href ?? `/portal/tren/ovelser/${exercise.id}`;

  return (
    <Link href={target} className="block">
      {content}
    </Link>
  );
}
