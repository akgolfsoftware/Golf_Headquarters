import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function CoachPlans() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <p className="text-sm text-muted-foreground">Krever Pro-abonnement.</p>
    );
  }

  const planer = await prisma.trainingPlan.findMany({
    where: {
      userId: user.id,
      createdById: { not: null },
    },
    include: {
      sessions: {
        select: { id: true, status: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Planer fra coach
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {planer.length === 0
            ? "Ingen coach-laget plan enda."
            : `${planer.length} planer fra coach.`}
        </p>
      </div>

      {planer.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Når en coach lager en plan til deg, vises den her. Egne ad-hoc-økter
          ligger på{" "}
          <span className="font-mono">
            <Link href="/portal/tren" className="text-primary hover:underline">
              /portal/tren
            </Link>
          </span>
          .
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {planer.map((p) => {
            const fullført = p.sessions.filter((s) => s.status === "COMPLETED").length;
            return (
              <li
                key={p.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/coach/plans/${p.id}`}
                    className="font-display text-base font-semibold text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  {p.isActive && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                      Aktiv
                    </span>
                  )}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Start{" "}
                  {p.startDate.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {p.endDate &&
                    ` · slutt ${p.endDate.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                    })}`}
                </div>
                <div className="mt-3 text-sm text-foreground">
                  {fullført} / {p.sessions.length} økter fullført
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
