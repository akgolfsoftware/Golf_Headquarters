import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function BanerPage() {
  const user = await requirePortalUser();

  const [courses, runder] = await Promise.all([
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.round.findMany({
      where: { userId: user.id },
      select: { courseId: true, sgTotal: true },
    }),
  ]);

  // Aggreger SG per bane for innlogget bruker
  const sgPerBane = new Map<string, { antall: number; sgSum: number; sgCount: number }>();
  for (const r of runder) {
    const eksisterende = sgPerBane.get(r.courseId) ?? { antall: 0, sgSum: 0, sgCount: 0 };
    eksisterende.antall += 1;
    if (r.sgTotal != null) {
      eksisterende.sgSum += r.sgTotal;
      eksisterende.sgCount += 1;
    }
    sgPerBane.set(r.courseId, eksisterende);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Baner
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {courses.length === 0
            ? "Ingen baner i databasen ennå."
            : `${courses.length} baner registrert. Statistikk vises for dine runder.`}
        </p>
      </div>

      {user.role === "ADMIN" && (
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Bane-administrasjon (CRUD) bygges i CoachHQ Fase 2.x. Per nå kan du
          legge til baner direkte i databasen.
        </div>
      )}

      {courses.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const stats = sgPerBane.get(c.id);
            const sgSnitt =
              stats && stats.sgCount > 0 ? stats.sgSum / stats.sgCount : null;
            return (
              <div
                key={c.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="font-display text-base font-semibold text-foreground">
                  {c.name}
                </div>
                <div className="mt-1 flex gap-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <span>par {c.par}</span>
                  {c.rating && <span>rating {c.rating}</span>}
                  {c.slope && <span>slope {c.slope}</span>}
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">
                    {stats?.antall ?? 0} runder
                  </span>
                  <span className="tabular-nums text-foreground">
                    SG{" "}
                    {sgSnitt != null
                      ? (sgSnitt >= 0 ? "+" : "") +
                        sgSnitt.toFixed(1).replace(".", ",")
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
