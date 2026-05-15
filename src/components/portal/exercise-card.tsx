"use client";

import { useState } from "react";
import { X, Play } from "lucide-react";
import type { ExerciseDefinition, PyramidArea, LPhase } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS:  "bg-pyr-fys/15 text-pyr-fys",
  TEK:  "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
};

const LPHASE_LABEL: Record<LPhase, string> = {
  GRUNN:     "Grunnperiode",
  SPESIAL:   "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
};

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function OvelseModal({
  exercise,
  onClose,
}: {
  exercise: ExerciseDefinition;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Lukk"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="p-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${PYR_BG[exercise.pyramidArea]}`}
            >
              {PYR_LABEL[exercise.pyramidArea]}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {LPHASE_LABEL[exercise.lPhase]}
            </span>
          </div>

          {/* Navn */}
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight">
            {exercise.name}
          </h2>

          {/* Beskrivelse */}
          {exercise.description && (
            <p className="mt-4 text-[15px] leading-[1.7] text-muted-foreground">
              {exercise.description}
            </p>
          )}

          {/* Metadata */}
          {(exercise.defaultRepsSets || exercise.csMin != null || exercise.csMax != null) && (
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-secondary/50 p-4">
              {exercise.defaultRepsSets && (
                <div>
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Sett / Reps
                  </div>
                  <div className="mt-1 font-mono text-xl font-medium tabular-nums text-foreground">
                    {exercise.defaultRepsSets}
                  </div>
                </div>
              )}
              {(exercise.csMin != null || exercise.csMax != null) && (
                <div>
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    CS-sone
                  </div>
                  <div className="mt-1 font-mono text-xl font-medium tabular-nums text-foreground">
                    {exercise.csMin ?? "?"}
                    {exercise.csMax != null ? `–${exercise.csMax}` : ""}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video */}
          {exercise.videoUrl && (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Play className="h-4 w-4" strokeWidth={2} />
              Se video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExerciseCard — klikk åpner modal
// ---------------------------------------------------------------------------

export function ExerciseCard({ exercise }: { exercise: ExerciseDefinition }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        className="flex cursor-pointer flex-col rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
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
          <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
            {exercise.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
          {exercise.defaultRepsSets && <span>{exercise.defaultRepsSets}</span>}
          {(exercise.csMin != null || exercise.csMax != null) && (
            <span>
              CS{" "}
              {exercise.csMin ?? "?"}
              {exercise.csMax != null ? `–${exercise.csMax}` : ""}
            </span>
          )}
          {exercise.videoUrl && (
            <span className="flex items-center gap-1 text-primary">
              <Play className="h-3 w-3" strokeWidth={2} />
              video
            </span>
          )}
        </div>
      </article>

      {open && (
        <OvelseModal exercise={exercise} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
