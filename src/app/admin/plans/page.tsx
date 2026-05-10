import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function AdminPlansList() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const plans = await prisma.trainingPlan.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, hcp: true, tier: true } },
      sessions: { select: { id: true, status: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Plans
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Trenings</em>planer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plans.length} planer totalt — {plans.filter((p) => p.isActive).length} aktive.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/plans/templates"
            className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
          >
            Maler
          </Link>
          <Link
            href="/admin/plans/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            + Ny plan
          </Link>
        </div>
      </header>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen planer registrert. Bygg den første via {"“"}+ Ny plan{"”"}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <Th>Spiller</Th>
                <Th>Plan</Th>
                <Th className="text-right">Økter</Th>
                <Th className="text-right">Fullført</Th>
                <Th className="text-right">Start</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => {
                const fullført = p.sessions.filter(
                  (s) => s.status === "COMPLETED"
                ).length;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <Td>
                      <Link
                        href={`/admin/elever/${p.user.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {p.user.name}
                      </Link>
                      {p.user.hcp != null && (
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                          HCP {p.user.hcp.toFixed(1).replace(".", ",")}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/plans/${p.id}`}
                        className="text-foreground hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </Td>
                    <Td className="text-right tabular-nums">
                      {p.sessions.length}
                    </Td>
                    <Td className="text-right tabular-nums">{fullført}</Td>
                    <Td className="text-right font-mono text-[10px] text-muted-foreground">
                      {p.startDate.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Td>
                    <Td>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                          p.isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 text-foreground ${className}`}>{children}</td>;
}
