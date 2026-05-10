import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { SesjonDetalj } from "@/components/portal/sesjon-detalj";

export default async function SessionDetalj({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
      drills: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
      log: true,
    },
  });
  if (!session) notFound();

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) {
    redirect("/portal/tren");
  }

  const kanStarte = user.tier !== "GRATIS" && erEier;

  return (
    <div className="space-y-6">
      <Link
        href="/portal/tren"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tilbake til plan
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {session.plan.name} · {session.scheduledAt.toLocaleDateString("nb-NO", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </header>

      <SesjonDetalj
        session={session}
        drills={session.drills}
        kanStarte={kanStarte}
      />

      {session.log && (
        <section className="rounded-lg border border-border bg-card p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Forrige logg
          </span>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="Startet"
              value={session.log.startedAt.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <Stat
              label="Fullført"
              value={
                session.log.completedAt
                  ? session.log.completedAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"
              }
            />
            <Stat
              label="CS oppnådd"
              value={session.log.csAchieved != null ? String(session.log.csAchieved) : "—"}
            />
            <Stat
              label="Vurdering"
              value={session.log.rating != null ? `${session.log.rating}/5` : "—"}
            />
          </div>
          {session.log.notes && (
            <p className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
              {session.log.notes}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-display text-base font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
