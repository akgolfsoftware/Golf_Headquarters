import Link from "next/link";
import type {
  TrainingPlanSession,
  SessionDrill,
  ExerciseDefinition,
  PyramidArea,
} from "@/generated/prisma/client";
import { PYR_LABEL } from "@/lib/pyramide";

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 text-pyr-fys",
  TEK: "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
};

type DrillMedDef = SessionDrill & { exercise: ExerciseDefinition };
type SesjonMedDrills = TrainingPlanSession & { drills: DrillMedDef[] };

export function DagensFokusCard({
  session,
  kanStarte,
}: {
  session: SesjonMedDrills | null;
  kanStarte: boolean;
}) {
  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Dagens fokus
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Ingen</em> økt i dag
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Bygg din egen i Ny økt-wizard, eller bli tildelt en plan av coach.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/portal/ny-okt"
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Ny økt
          </Link>
          <Link
            href="/portal/tren"
            className="rounded-md border border-input bg-card px-6 py-2.5 text-sm font-medium text-foreground"
          >
            Se planen
          </Link>
        </div>
      </div>
    );
  }

  const tidspunkt = new Date(session.scheduledAt).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Dagens fokus
        </span>
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

      <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
        {session.title}
      </h2>
      {session.rationale && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {session.rationale}
        </p>
      )}

      {session.drills.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-foreground">
          {session.drills.slice(0, 3).map((d) => (
            <li key={d.id} className="flex justify-between gap-4">
              <span className="truncate">{d.exercise.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {d.repsSets}
              </span>
            </li>
          ))}
          {session.drills.length > 3 && (
            <li className="font-mono text-[11px] text-muted-foreground">
              + {session.drills.length - 3} flere
            </li>
          )}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        {kanStarte ? (
          <Link
            href={`/portal/live/${session.id}`}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start økt →
          </Link>
        ) : (
          <Link
            href="/portal/meg/abonnement"
            className="rounded-md border border-input bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Live Session krever Pro
          </Link>
        )}
        <Link
          href={`/portal/tren?dato=${session.scheduledAt.toISOString().split("T")[0]}`}
          className="rounded-md border border-input bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:border-border active:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Se i plan
        </Link>
      </div>
    </article>
  );
}
