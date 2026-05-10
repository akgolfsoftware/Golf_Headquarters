import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function TeamAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const team = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    include: {
      _count: {
        select: {
          coachedGroups: true,
          coachAvailability: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Team
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">AK Golf</em>-team
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Coacher og administratorer som har tilgang til CoachHQ.
        </p>
      </header>

      {team.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen team-medlemmer ennå.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((u) => {
            const initial = u.name.trim().charAt(0).toUpperCase() || "?";
            return (
              <article
                key={u.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{u.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        u.role === "ADMIN"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{u.email}</p>
                  <div className="mt-3 flex gap-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    <span>{u._count.coachedGroups} grupper</span>
                    <span>{u._count.coachAvailability} tidsvinduer</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Invitering av nye coacher skjer i v2 via Supabase Auth admin API.
        Foreløpig: opprett bruker direkte i Supabase Auth og oppdater rolle i Prisma Studio.
      </div>
    </div>
  );
}
