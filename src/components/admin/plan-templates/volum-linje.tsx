"use client";

/**
 * Volum-linje for mal-editoren: viser timer/uke og reell pyramidefordeling
 * beregnet fra faktiske økter, med varsel når glidere og virkelighet spriker.
 * Bevisst prop-drevet uten server-action-import — verifiserbar isolert.
 */

import { PYR_COLOR, PYR_LABEL, type DisciplinFordeling } from "./shared";
import { beregnTemplateVolum, type VolumSesjon } from "@/lib/plan-templates/beregn-volum";

const PYR_ALLE: (keyof DisciplinFordeling)[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const AVVIK_TERSKEL_PP = 10;

export interface VolumSammendragProps {
  sessions: VolumSesjon[];
  varighetUker: number;
  fordeling: DisciplinFordeling;
  fordelingSum: number;
}

export function VolumSammendrag({ sessions, varighetUker, fordeling, fordelingSum }: VolumSammendragProps) {
  const volum = beregnTemplateVolum(sessions, varighetUker, fordeling);
  const visAvvik = volum.storsteAvvik && volum.storsteAvvik.diffPp > AVVIK_TERSKEL_PP;

  return (
    <div className="mb-3 rounded-md border border-border bg-background/30 p-2.5">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>Volum</span>
        <span className="text-foreground">{volum.timerLabel}</span>
      </div>
      {sessions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
          {PYR_ALLE.map((p) => (
            <span key={p} className="inline-flex items-center gap-1">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: PYR_COLOR[p] }}
              />
              {PYR_LABEL[p]} {volum.realisertProsent[p]}%
            </span>
          ))}
        </div>
      )}
      {fordelingSum !== 100 && (
        <p className="mt-1.5 text-[10px] text-destructive">
          Fordelingen summerer til {fordelingSum} % — må være 100 %.
        </p>
      )}
      {visAvvik && volum.storsteAvvik && (
        <p className="mt-1 text-[10px] text-destructive">
          Øktene gir {PYR_LABEL[volum.storsteAvvik.omrade]} {volum.realisertProsent[volum.storsteAvvik.omrade]} % —
          glideren sier {Math.round(fordeling[volum.storsteAvvik.omrade] * 100)} %.
        </p>
      )}
    </div>
  );
}

/** Viser minutter (forhåndsberegnet av parent via beregnTemplateVolum) som «X,X t». Skjuler seg selv for tomme uker. */
export function UkeVolumChip({ minutter }: { minutter: number }) {
  if (minutter <= 0) return null;
  const timer = Math.round((minutter / 60) * 10) / 10;
  return (
    <span className="font-mono text-[9px] text-muted-foreground">
      {timer.toFixed(1).replace(".", ",")} t
    </span>
  );
}
