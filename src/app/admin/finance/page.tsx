import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Banknote,
  Clock,
  CreditCard,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function FinanceAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [aktive, pastDue, cancelled, alleSubs, totalProBrukere] =
    await Promise.all([
      prisma.subscription.count({ where: { status: "ACTIVE", tier: "PRO" } }),
      prisma.subscription.count({ where: { status: "PAST_DUE" } }),
      prisma.subscription.count({ where: { status: "CANCELLED" } }),
      prisma.subscription.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
      prisma.user.count({ where: { role: "PLAYER", tier: "PRO" } }),
    ]);

  // Beregnet inntekt: aktive Pro × 300 kr/mnd
  const monthlyRevenue = aktive * 300;
  const yearlyRevenue = monthlyRevenue * 12;
  const snittPerSpiller =
    totalProBrukere > 0 ? Math.round(monthlyRevenue / totalProBrukere) : 0;

  const eyebrowMonth = new Date().toLocaleDateString("nb-NO", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* HERO */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Økonomi · {eyebrowMonth}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Økonomi —{" "}
            <em className="font-normal italic text-primary">pulsen</em> i
            driften.
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Estimater basert på aktive abonnement · Faktiske beløp i Stripe
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Periode
          </span>
          <span className="font-medium">Inneværende måned</span>
        </div>
      </header>

      {/* KPI STRIP */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroKpi
          icon={Banknote}
          label="Inntekt MTD"
          value={`${monthlyRevenue.toLocaleString("nb-NO")}`}
          unit="kr"
          sub={`${aktive} aktive Pro · ${yearlyRevenue.toLocaleString(
            "nb-NO",
          )} kr / år`}
        />
        <Kpi
          icon={Users}
          label="Snitt per spiller"
          value={`${snittPerSpiller.toLocaleString("nb-NO")}`}
          unit="kr"
          sub={`${totalProBrukere} Pro-spillere totalt`}
        />
        <Kpi
          icon={Clock}
          label="Past due"
          value={String(pastDue)}
          sub="Krever oppfølging"
          tone={pastDue > 0 ? "warn" : "neutral"}
        />
        <Kpi
          icon={AlertCircle}
          label="Kansellerte"
          value={String(cancelled)}
          sub="Totalt avsluttede"
        />
      </section>

      {/* TABELL */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Siste{" "}
            <em className="font-normal italic text-primary">
              abonnement-endringer
            </em>
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {alleSubs.length} rader · sortert nyest først
          </span>
        </div>

        {alleSubs.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            titleItalic="Ingen abonnementer"
            titleTrail="ennå"
            sub="Når spillere starter Pro-abonnement vises endringene her."
          />
        ) : (
          <>
            {/* Desktop tabell */}
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
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
                        <div className="flex items-center gap-3">
                          <Avatar name={s.user.name} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {s.user.name}
                            </div>
                            <div className="truncate font-mono text-[10px] text-muted-foreground">
                              {s.user.email}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <TierPill tier={s.tier} />
                      </Td>
                      <Td>
                        <StatusPill status={s.status} />
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

            {/* Mobile-liste */}
            <ul className="space-y-2 md:hidden">
              {alleSubs.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={s.user.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">
                        {s.user.name}
                      </div>
                      <div className="truncate font-mono text-[10px] text-muted-foreground">
                        {s.user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TierPill tier={s.tier} />
                    <StatusPill status={s.status} />
                    {s.currentPeriodEnd && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Neste:{" "}
                        {s.currentPeriodEnd.toLocaleDateString("nb-NO", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

// ---------- helpers ----------

function HeroKpi({
  icon: Icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  // Mørk hero-KPI med gradient — én av de tre "lime" highlight-punktene.
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 shadow-sm sm:col-span-2 lg:col-span-1"
      style={{
        background:
          "linear-gradient(135deg, #0F2A22 0%, #163027 60%, #0A1F18 100%)",
        borderColor: "#274d41",
      }}
    >
      <div
        className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "rgba(209,248,67,0.7)" }}
      >
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-mono text-4xl font-semibold tabular-nums"
          style={{ color: "#F5F4EE" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-medium"
            style={{ color: "rgba(245,244,238,0.65)" }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <p
          className="mt-2 font-mono text-[11px]"
          style={{ color: "rgba(245,244,238,0.65)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon
          size={14}
          strokeWidth={1.75}
          className={
            tone === "warn" ? "text-destructive" : "text-muted-foreground"
          }
        />
        {label}
      </div>
      <div
        className={`mt-1 flex items-baseline gap-2 font-mono text-3xl font-semibold tabular-nums ${
          tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        <span>{value}</span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";
  return (
    <div
      aria-hidden="true"
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display text-[11px] font-semibold text-white"
      style={{
        background: "linear-gradient(135deg, #005840 0%, #1A7D56 100%)",
      }}
    >
      {initials}
    </div>
  );
}

function TierPill({ tier }: { tier: string }) {
  const isPro = tier === "PRO";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
        isPro
          ? "bg-primary/10 text-primary"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {tier}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; className: string }
  > = {
    ACTIVE: {
      label: "Aktiv",
      className: "bg-primary/10 text-primary",
    },
    PAST_DUE: {
      label: "Forfalt",
      className: "bg-destructive/15 text-destructive",
    },
    CANCELLED: {
      label: "Kansellert",
      className: "bg-secondary text-muted-foreground",
    },
    PAUSED: {
      label: "Pauset",
      className: "bg-secondary text-muted-foreground",
    },
  };
  const c = config[status] ?? {
    label: status,
    className: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${c.className}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
      />
      {c.label}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
