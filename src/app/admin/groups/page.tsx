import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Grupper
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Treningsgrupper</em> & nivåer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A1–A5 er AK Golf-nivåer. Spillere kan være medlem i flere grupper.
          </p>
        </div>
        <GroupForm coaches={coachOptions} triggerLabel="+ Ny gruppe" />
      </header>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen grupper opprettet ennå.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li
              key={g.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/groups/${g.id}`}
                    className="font-display text-base font-semibold text-foreground hover:text-primary"
                  >
                    {g.name}
                  </Link>
                  {g.coach?.name && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Coach: {g.coach.name}
                    </p>
                  )}
                </div>
                {g.level && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                    {g.level}
                  </span>
                )}
              </div>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                {g._count.members} medlem{g._count.members === 1 ? "" : "mer"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
