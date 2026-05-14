// AgencyOS · Økonomi — Stripe KPI + 7-mnd inntektsgraf + faktura-tabell.
// Speiler FinanceScreen fra Claude artifact AK Golf AgencyOS.

import Link from "next/link";
import { TrendingUp, Flag, ArrowUpRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function formatNok(ore: number): string {
  return new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100));
}

export default async function OkonomiTabPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const mndStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mndSlutt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const forrigeMndStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 7 måneder tilbake fra denne (inkl. denne)
  const seksTilbake = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const [denneMnd, forrigeMnd, alleSeks, utestaende, sisteFakturaer] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      _count: true,
      where: { status: "SUCCEEDED", paidAt: { gte: mndStart, lt: mndSlutt } },
    }),
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      where: { status: "SUCCEEDED", paidAt: { gte: forrigeMndStart, lt: mndStart } },
    }),
    prisma.payment.findMany({
      where: { status: "SUCCEEDED", paidAt: { gte: seksTilbake } },
      select: { paidAt: true, amountOre: true },
    }),
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      _count: true,
      where: { status: "PENDING" },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: true },
    }),
  ]);

  // Bygg månedlig serie
  const mndSerie: { label: string; ore: number; erDenne: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dSlutt = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const sum = alleSeks
      .filter((p) => p.paidAt && p.paidAt >= d && p.paidAt < dSlutt)
      .reduce((s, p) => s + p.amountOre, 0);
    mndSerie.push({ label: MND_KORT[d.getMonth()], ore: sum, erDenne: i === 0 });
  }
  const maksOre = Math.max(1, ...mndSerie.map((m) => m.ore));

  const denneOre = denneMnd._sum.amountOre ?? 0;
  const forrigeOre = forrigeMnd._sum.amountOre ?? 0;
  const endring = forrigeOre > 0 ? Math.round(((denneOre - forrigeOre) / forrigeOre) * 100) : 0;
  const utestaendeOre = utestaende._sum.amountOre ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`AgencyOS · Stripe · ${MND_KORT[now.getMonth()]} ${now.getFullYear()}`}
        titleLead="Økonomi"
        titleItalic="i kontroll"
        sub="Caddie sender, purrer og avstemmer mot Notion-prosjekter."
        actions={
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Åpne Stripe <ArrowUpRight className="h-4 w-4" />
          </a>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <FinKpi
          label="Innbetalt denne mnd"
          value={`kr ${formatNok(denneOre)}`}
          delta={endring === 0 ? "Ingen sammenligning" : `${endring > 0 ? "+" : ""}${endring}% mot forrige`}
          tone={endring < 0 ? "warn" : "good"}
        />
        <FinKpi label="Innbetalinger" value={String(denneMnd._count)} delta="transaksjoner" tone="good" />
        <FinKpi
          label="Utestående"
          value={`kr ${formatNok(utestaendeOre)}`}
          delta={`${utestaende._count} faktura ute`}
          tone={utestaendeOre > 0 ? "warn" : "good"}
        />
        <FinKpi label="Pipeline · neste 30d" value="kr —" delta="kommer V1.5" tone="good" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Inntektsgraf */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Inntekt — siste <em>7 måneder</em>
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Beløp i kr · sum innbetalt per måned
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                EKSPORT CSV
              </span>
            </div>
            <div className="mt-6 grid grid-cols-7 items-end gap-2">
              {mndSerie.map((m, i) => {
                const hPct = (m.ore / maksOre) * 100;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative h-32 w-full">
                      <div
                        className={`absolute bottom-0 w-full rounded-t-sm transition-all ${
                          m.erDenne ? "bg-accent" : "bg-primary/70"
                        }`}
                        style={{ height: `${Math.max(hPct, 2)}%` }}
                      />
                    </div>
                    <div
                      className={`mt-2 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        m.erDenne ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {m.label}
                    </div>
                    <div className="font-mono text-[10px] tabular-nums text-foreground">
                      {m.ore > 0 ? formatNok(m.ore) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Faktura-tabell */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Siste <em>fakturaer</em>
              </h2>
              <Link
                href="/admin/finance"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Alle →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <Th>Kunde</Th>
                    <Th>Type</Th>
                    <Th>Beløp</Th>
                    <Th>Status</Th>
                    <Th>Dato</Th>
                  </tr>
                </thead>
                <tbody>
                  {sisteFakturaer.map((p) => (
                    <tr key={p.id} className="border-t border-border/60">
                      <Td>{p.user?.name ?? "—"}</Td>
                      <Td mono>{p.type}</Td>
                      <Td mono>kr {formatNok(p.amountOre)}</Td>
                      <Td>
                        <StatusPill status={p.status} />
                      </Td>
                      <Td mono>
                        {(p.paidAt ?? p.createdAt).toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Td>
                    </tr>
                  ))}
                  {sisteFakturaer.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        Ingen transaksjoner ennå.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidekolonne — Caddies forslag */}
        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Caddies <em>forslag</em>
            </h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-border bg-secondary/40 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Stub · M16-utvidelse
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Caddie vil foreslå vinterpakker, purringer og avstemming her når AI-agentene kobles på.
                </p>
              </div>
            </div>
          </section>

          {utestaendeOre > 0 && (
            <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
                <Flag className="h-3 w-3" /> Utestående
              </div>
              <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
                kr {formatNok(utestaendeOre)}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {utestaende._count} faktura venter
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function FinKpi({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</div>
      <div
        className={`mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
          tone === "warn" ? "text-destructive" : "text-primary"
        }`}
      >
        {tone === "warn" ? <Flag className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
        {delta}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const klass =
    status === "SUCCEEDED"
      ? "bg-primary/10 text-primary"
      : status === "FAILED" || status === "REFUNDED"
        ? "bg-destructive/10 text-destructive"
        : "bg-accent/15 text-accent-foreground";
  return (
    <span className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${klass}`}>
      {status.toLowerCase()}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children, mono = false }: { children?: React.ReactNode; mono?: boolean }) {
  return <td className={`px-4 py-2.5 ${mono ? "font-mono tabular-nums" : ""}`}>{children}</td>;
}
