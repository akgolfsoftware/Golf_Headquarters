import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  aggregateByArea,
  prosentPerArea,
  PYR_REKKEFOLGE,
  PYR_LABEL,
  PYR_BG_KLASSE,
} from "@/lib/pyramide";
import { PlanActions } from "./plan-actions";

export default async function AdminPlanDetalj({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { planId } = await params;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      user: { select: { id: true, name: true, hcp: true, tier: true } },
      sessions: {
        include: {
          drills: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
          log: true,
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });
  if (!plan) notFound();

  const fordeling = prosentPerArea(aggregateByArea(plan.sessions));
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const gjennomforing =
    plan.sessions.length === 0
      ? 0
      : Math.round((fullført / plan.sessions.length) * 100);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Alle planer
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Plan for{" "}
            <Link
              href={`/admin/elever/${plan.user.id}`}
              className="text-primary hover:underline"
            >
              {plan.user.name}
            </Link>
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            {plan.name}
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {plan.startDate.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            {plan.endDate &&
              ` – ${plan.endDate.toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
              })}`}
          </p>
        </div>
        <PlanActions planId={plan.id} isActive={plan.isActive} />
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Gjennomføring
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {fullført}
            </span>
            <span className="text-sm text-muted-foreground">
              av {plan.sessions.length} økter ({gjennomforing}%)
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary"
              style={{ width: `${gjennomforing}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Pyramide-fordeling
          </span>
          <div className="mt-3 space-y-1.5">
            {PYR_REKKEFOLGE.map((omr) => (
              <div key={omr} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {PYR_LABEL[omr]}
                </span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-border/40">
                  <div
                    className={`h-full ${PYR_BG_KLASSE[omr]}`}
                    style={{ width: `${Math.max(fordeling[omr], 2)}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono tabular-nums">
                  {fordeling[omr]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Økter
        </h3>
        {plan.sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            Ingen økter lagt til ennå.
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.sessions.map((s) => (
              <li
                key={s.id}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/portal/tren/${s.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {s.title}
                    </Link>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {s.scheduledAt.toLocaleDateString("nb-NO", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      · {s.pyramidArea} · {s.durationMin} min · {s.drills.length} drills
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      s.status === "COMPLETED"
                        ? "bg-primary/10 text-primary"
                        : s.status === "ACTIVE"
                        ? "bg-accent/30 text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
