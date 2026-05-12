import { Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

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

  const coachCount = team.filter((u) => u.role === "COACH").length;
  const adminCount = team.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Team"
        titleLead="AK Golf"
        titleItalic="team"
        sub={`${team.length} medlemmer · ${adminCount} admin · ${coachCount} coacher med tilgang til CoachHQ.`}
      />

      {team.length === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen team"
          titleTrail="medlemmer ennå"
          sub="Opprett bruker i Supabase Auth og sett rolle COACH/ADMIN i Prisma Studio."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((u) => {
            const initial = u.name.trim().charAt(0).toUpperCase() || "?";
            return (
              <article
                key={u.id}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
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
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <Stat label="Grupper" value={String(u._count.coachedGroups)} />
                  <Stat label="Tidsvinduer" value={String(u._count.coachAvailability)} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        Invitering av nye coacher skjer i v2 via Supabase Auth admin API. Foreløpig:
        opprett bruker direkte i Supabase Auth og oppdater rolle i Prisma Studio.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[18px] font-semibold leading-none tabular-nums">
        {value}
      </div>
    </div>
  );
}
