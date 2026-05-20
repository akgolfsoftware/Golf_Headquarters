import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Play,
  Target,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-[rgba(0,88,64,0.13)] text-[var(--color-pyr-fys)]",
  TEK: "bg-[rgba(26,125,86,0.13)] text-[var(--color-pyr-tek)]",
  SLAG: "bg-[rgba(184,133,42,0.13)] text-[var(--color-pyr-spill)]",
  SPILL: "bg-[rgba(184,133,42,0.13)] text-[var(--color-pyr-spill)]",
  TURN: "bg-[rgba(94,92,87,0.13)] text-[var(--color-pyr-turn)]",
};

/**
 * Live-økt · brief — pre-økt-side som viser plan-kontekst, foreslåtte øvelser
 * og mål før spilleren starter selve økten.
 * Designet etter wireframe/design-package/project/07-live-okt-brief.html
 */
export default async function LiveBriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
      drills: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!session) notFound();

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) {
    redirect("/portal/tren");
  }

  const scheduled = new Date(session.scheduledAt);
  const datoStr = scheduled.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const tidStr = scheduled.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalReps = session.drills.reduce((sum, d) => {
    // repsSets f.eks. "3x10" eller "20" → enkel parse
    const m = d.repsSets.match(/(\d+)\s*[x×*]\s*(\d+)/i);
    if (m) return sum + Number(m[1]) * Number(m[2]);
    const n = parseInt(d.repsSets, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  // Pyramide-fordeling — tell drills per område for sprekken under hero.
  const pyrCount = new Map<PyramidArea, number>();
  for (const d of session.drills) {
    const a = d.exercise.pyramidArea;
    pyrCount.set(a, (pyrCount.get(a) ?? 0) + 1);
  }

  const kanStarte =
    user.tier !== "GRATIS" && erEier && session.status !== "COMPLETED";

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href={`/portal/tren/${session.id}`}
        className="inline-flex h-11 items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til økt-detalj
      </Link>

      {/* Hero — brief */}
      <section className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 md:gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-3.5">
          <div className="inline-flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              style={{ boxShadow: "0 0 0 3px rgba(0,88,64,0.12)" }}
            />
            {session.plan.name} · {session.pyramidArea}
          </div>
          <h1 className="font-display text-[28px] font-medium leading-[1.1] -tracking-[0.02em] text-foreground sm:text-[36px]">
            {PYR_LABEL[session.pyramidArea]}-økt{" "}
            <em className="font-normal italic text-muted-foreground">
              {session.title}
            </em>
          </h1>
          {session.rationale && (
            <p className="max-w-[540px] font-display text-[16px] italic leading-[1.4] text-muted-foreground">
              {session.rationale}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-5">
            <MetaItem
              icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Dato"
              value={datoStr}
            />
            <MetaItem
              icon={<Clock className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Tid"
              value={tidStr}
            />
            <MetaItem
              icon={<Target className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Varighet"
              value={`${session.durationMin} min`}
            />
            <MetaItem
              icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Reps planlagt"
              value={totalReps > 0 ? String(totalReps) : "—"}
            />
          </div>
        </div>

        {/* Høyre — CTA */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 rounded-2xl bg-primary p-5 text-primary-foreground">
            <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.10em] opacity-65">
              I dag · {scheduled.toLocaleDateString("nb-NO", { weekday: "long" })}
            </div>
            <div className="font-mono text-[28px] font-semibold -tracking-[0.01em] tabular-nums">
              {tidStr}
            </div>
            <div className="font-sans text-[13px] leading-[1.4] opacity-85">
              {session.plan.name}
            </div>
          </div>

          {kanStarte ? (
            <Link
              href={`/portal/live/${session.id}`}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-accent px-6 py-4 font-display text-[16px] font-semibold -tracking-[0.01em] text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Play className="h-4 w-4" strokeWidth={2.5} />
              Start økt
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center rounded-md border border-dashed border-border px-6 py-4 text-[14px] text-muted-foreground">
              {session.status === "COMPLETED"
                ? "Økten er fullført"
                : "Live krever Pro"}
            </span>
          )}

          <div className="flex gap-2">
            <Link
              href={`/portal/live/${session.id}/tapper`}
              className="flex-1 rounded-md border border-border bg-secondary px-4 py-2.5 text-center font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Tapper-modus
            </Link>
            <Link
              href={`/portal/tren/${session.id}`}
              className="flex-1 rounded-md border border-border bg-secondary px-4 py-2.5 text-center font-sans text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Detaljvisning
            </Link>
          </div>
        </div>
      </section>

      {/* Pyramide-fordeling */}
      {pyrCount.size > 0 && (
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Fordeling i pyramide
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {session.drills.length}{" "}
              {session.drills.length === 1 ? "øvelse" : "øvelser"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Array.from(pyrCount.entries()).map(([area, count]) => (
              <div
                key={area}
                className={`flex items-center justify-between rounded-md px-3 py-2 font-mono text-[11px] ${PYR_PILL[area]}`}
              >
                <span className="font-bold">{area}</span>
                <span className="tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Drills — brief-liste */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
            Foreslåtte øvelser
          </h2>
          <div className="font-mono text-[12px] text-muted-foreground">
            {session.drills.length}{" "}
            {session.drills.length === 1 ? "øvelse" : "øvelser"} · {totalReps}{" "}
            reps
          </div>
        </div>

        {session.drills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Ingen øvelser lagt til ennå.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {session.drills.map((d, i) => (
              <div
                key={d.id}
                className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:grid-cols-[28px_1fr_auto_auto] sm:gap-3.5 sm:px-4 sm:py-3.5"
              >
                <div className="grid h-7 w-7 place-items-center rounded-md bg-secondary font-mono text-[12px] font-bold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-[14px] font-medium -tracking-[0.005em] text-foreground">
                    {d.exercise.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium tracking-[0.04em] ${PYR_PILL[d.exercise.pyramidArea]}`}
                    >
                      {d.exercise.pyramidArea}
                    </span>
                    {d.exercise.lPhase && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                        {d.exercise.lPhase}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px] font-semibold text-foreground tabular-nums">
                    {d.repsSets}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    reps
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px] font-semibold text-foreground tabular-nums">
                    {d.csTarget ?? "—"}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    CS-mål
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      {kanStarte && (
        <div className="flex justify-end border-t border-border pt-6">
          <Link
            href={`/portal/live/${session.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-sans text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Gå til live
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      <span>
        {label}: <b className="font-semibold text-foreground">{value}</b>
      </span>
    </div>
  );
}
