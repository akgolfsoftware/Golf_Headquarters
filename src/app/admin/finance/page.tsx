import { CreditCard } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function FinanceAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [aktive, pastDue, cancelled, alleSubs] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE", tier: "PRO" } }),
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),
    prisma.subscription.count({ where: { status: "CANCELLED" } }),
    prisma.subscription.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  // Beregnet inntekt: aktive Pro × 300 kr/mnd
  const monthlyRevenue = aktive * 300;
  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Økonomi"
        titleItalic="Inntekt"
        titleTrail="& abonnement"
        sub="Estimater basert på aktive abonnement. Faktiske beløp i Stripe Dashboard."
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Månedlig inntekt"
          value={`${monthlyRevenue.toLocaleString("nb-NO")} kr`}
          sub={`${aktive} aktive Pro`}
        />
        <Stat
          label="Årlig (anslag)"
          value={`${yearlyRevenue.toLocaleString("nb-NO")} kr`}
          sub="Hvis 100% retention"
        />
        <Stat
          label="Past due"
          value={String(pastDue)}
          sub="Krever oppfølging"
        />
        <Stat
          label="Kansellerte"
          value={String(cancelled)}
          sub="Total"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Siste abonnement-endringer
        </h3>
        {alleSubs.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            titleItalic="Ingen abonnementer"
            titleTrail="ennå"
            sub="Når spillere starter Pro-abonnement vises endringene her."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left">
                <tr>
                  <Th>Spiller</Th>
                  <Th>Tier</Th>
                  <Th>Status</Th>
                  <Th>Neste betaling</Th>
                  <Th>Oppdatert</Th>
                </tr>
              </thead>
              <tbody>
                {alleSubs.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                  >
                    <Td>
                      <span className="font-medium">{s.user.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                        {s.user.email}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                          s.tier === "PRO"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {s.tier}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                          s.status === "ACTIVE"
                            ? "bg-primary/10 text-primary"
                            : s.status === "PAST_DUE"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
                    </Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {s.currentPeriodEnd
                        ? s.currentPeriodEnd.toLocaleDateString("nb-NO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {s.updatedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
