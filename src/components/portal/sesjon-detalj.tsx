import Link from "next/link";
import type {
  TrainingPlanSession,
  SessionDrill,
  ExerciseDefinition,
  PyramidArea,
} from "@/generated/prisma/client";

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

type DrillMedDef = SessionDrill & { exercise: ExerciseDefinition };

export function SesjonDetalj({
  session,
  drills,
  kanStarte,
}: {
  session: TrainingPlanSession;
  drills: DrillMedDef[];
  kanStarte: boolean;
}) {
  const tidspunkt = new Date(session.scheduledAt).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="space-y-6 rounded-lg border border-border bg-card p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
              PYR_BG[session.pyramidArea]
            }`}
          >
            {PYR_LABEL[session.pyramidArea]}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {tidspunkt} · {session.durationMin} min
          </span>
        </div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          {session.title}
        </h2>
        {session.rationale && (
          <p className="text-sm text-muted-foreground">{session.rationale}</p>
        )}
      </header>

      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Drills ({drills.length})
        </span>
        <ul className="mt-2 divide-y divide-border rounded-md border border-border">
          {drills.length === 0 ? (
            <li className="px-4 py-4 text-sm text-muted-foreground">
              Ingen drills lagt til ennå.
            </li>
          ) : (
            drills.map((d) => (
              <li key={d.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">
                      {d.exercise.name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      <span>{d.repsSets}</span>
                      {d.csTarget && <span>cs {d.csTarget}</span>}
                      <span>L-fase {d.exercise.lPhase}</span>
                    </div>
                  </div>
                </div>
                {d.notes && (
                  <p className="mt-2 text-xs text-muted-foreground">{d.notes}</p>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        {kanStarte ? (
          <Link
            href={`/portal/live/${session.id}`}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start økt →
          </Link>
        ) : (
          <span className="rounded-md border border-dashed border-border px-6 py-2.5 text-sm text-muted-foreground">
            Live Session krever Pro
          </span>
        )}
        <span className="rounded-md border border-input bg-card px-6 py-2.5 text-sm text-muted-foreground">
          Status: {session.status}
        </span>
      </div>
    </article>
  );
}
