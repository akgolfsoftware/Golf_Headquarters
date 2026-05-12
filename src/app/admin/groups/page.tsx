import Link from "next/link";
import { UsersRound } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GroupForm } from "./group-form";

export default async function Grupper() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [groups, coaches] = await Promise.all([
    prisma.group.findMany({
      include: {
        coach: { select: { name: true } },
        _count: { select: { members: true } },
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const coachOptions = coaches.map((c) => ({ id: c.id, name: c.name ?? "(uten navn)" }));
  const totaltMedlemmer = groups.reduce((sum, g) => sum + g._count.members, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Grupper"
        titleLead="Treningsgrupper"
        titleItalic="& nivåer"
        sub={`${groups.length} grupper · ${totaltMedlemmer} medlemmer. A1–A5 er AK Golf-nivåer.`}
        actions={<GroupForm coaches={coachOptions} triggerLabel="+ Ny gruppe" />}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          titleItalic="Ingen grupper"
          titleTrail="opprettet ennå"
          sub="Grupper organiserer spillere på tvers av klubber og nivåer. Klikk «+ Ny gruppe»."
        />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const initial = g.name.charAt(0).toUpperCase();
            return (
              <li
                key={g.id}
                className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
              >
                <div className="bg-gradient-to-br from-primary to-[#003B2A] px-6 py-6 text-primary-foreground">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-display text-[18px] font-semibold">
                        {initial}
                      </span>
                      <div>
                        <Link
                          href={`/admin/groups/${g.id}`}
                          className="font-display text-[18px] font-semibold leading-tight hover:underline"
                        >
                          {g.name}
                        </Link>
                        {g.coach?.name && (
                          <div className="mt-1 text-[12px] opacity-80">
                            Coach: {g.coach.name}
                          </div>
                        )}
                      </div>
                    </div>
                    {g.level && (
                      <span
                        className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.10em]"
                      >
                        {g.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Medlemmer
                  </div>
                  <div className="mt-1 font-mono text-[24px] font-semibold leading-none tabular-nums">
                    {g._count.members}
                  </div>
                  <Link
                    href={`/admin/groups/${g.id}`}
                    className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
                  >
                    Åpne gruppe
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
