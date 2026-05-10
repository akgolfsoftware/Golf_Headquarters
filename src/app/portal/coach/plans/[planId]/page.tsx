import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateByArea, prosentPerArea, PYR_REKKEFOLGE, PYR_LABEL, PYR_BG_KLASSE } from "@/lib/pyramide";

export default async function CoachPlanDetalj({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const user = await requirePortalUser();
  const { planId } = await params;

  if (user.tier === "GRATIS") {
    return <p className="text-sm text-muted-foreground">Krever Pro-abonnement.</p>;
  }

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      sessions: {
        include: { drills: { include: { exercise: true } } },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });
  if (!plan) notFound();
  if (plan.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    notFound();
  }

  const fordeling = prosentPerArea(aggregateByArea(plan.sessions));
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const gjennomforing =
    plan.sessions.length === 0 ? 0 : Math.round((fullført / plan.sessions.length) * 100);

  return (
    <div className="space-y-6">
      <Link
        href="/portal/coach/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Alle planer
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach-laget plan
          </span>
          {plan.isActive && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
              Aktiv
            </span>
          )}
        </div>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight">
          {plan.name}
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Start{" "}
          {plan.startDate.toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          {plan.endDate &&
            ` · slutt ${plan.endDate.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
            })}`}
        </p>
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
              av {plan.sessions.length} økter
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary"
              style={{ width: `${gjennomforing}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{gjennomforing}% fullført</p>
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
            Ingen økter er lagt inn i planen ennå.
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/portal/tren/${s.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {s.title}
                  </Link>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {s.scheduledAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    · {s.pyramidArea} · {s.durationMin} min · {s.drills.length} drills
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    s.status === "COMPLETED"
                      ? "bg-primary/10 text-primary"
                      : s.status === "ACTIVE"
                      ? "bg-accent/30 text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
