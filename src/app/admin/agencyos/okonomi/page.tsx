/**
 * AgencyOS · Økonomi (/admin/agencyos/okonomi) — coachens business-kontrolltårn
 * for penger. Re-stylet til godkjent AgencyOS-DNA (Bloomberg-tetthet, mono-
 * eyebrows, lime-aksent, DS-tokens). Alle tall er ekte Prisma — ingen oppdiktede.
 *
 *   KPI-strip (4): MRR coaching · Innbetalt mnd · Utestående · Aktive abonnement
 *   Inntektsgraf — siste 6 måneder (sum innbetalt per mnd, denne mnd lime)
 *   Faktura-tabell — siste 12 transaksjoner
 *   Sidekolonne — MRR-sammensetning (PRO-abonnement) + utestående-flagg
 *
 * MRR utledes ærlig fra aktive PRO-abonnement × 300 kr (kanonisk pris, ELITE
 * finnes ikke i UI). Ingen abonnement → MRR 0 + tomstate-tekst.
 */

import Link from "next/link";
import { ArrowUpRight, Flag, Repeat, TrendingDown, TrendingUp, Users } from "lucide-react";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

// Kanonisk PRO-pris (kr/mnd). ELITE er dødt enum — ekskluderes fra MRR.
const PRO_PRIS_KR = 300;

function formatNok(ore: number): string {
  return new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100));
}

function formatKr(kr: number): string {
  return new Intl.NumberFormat("nb-NO").format(Math.round(kr));
}

export default async function OkonomiTabPage() {
  await requireCapability(Capability.VIEW_FINANCE);

  const now = new Date();
  const mndStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mndSlutt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const forrigeMndStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // 6 måneder tilbake fra denne (inkl. denne) = 6 søyler.
  const femTilbake = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [denneMnd, forrigeMnd, alleSeks, utestaende, sisteFakturaer, proAktive] =
    await Promise.all([
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
        where: { status: "SUCCEEDED", paidAt: { gte: femTilbake } },
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
        include: { user: { select: { name: true } } },
      }),
      // MRR-grunnlag: aktive PRO-abonnement (ekte rader, ikke estimat).
      prisma.subscription.count({
        where: { tier: "PRO", status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
      }),
    ]);

  // Månedlig serie (6 mnd).
  const mndSerie: { label: string; ore: number; erDenne: boolean }[] = [];
  for (let i = 5; i >= 0; i--) {
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

  const mrrKr = proAktive * PRO_PRIS_KR;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      <PageHeader
        eyebrow={`AgencyOS · Stripe · ${MND_KORT[now.getMonth()]} ${now.getFullYear()}`}
        titleLead="Økonomi"
        titleItalic="i kontroll"
        sub="MRR fra coaching-abonnement, innbetalinger og utestående — samlet."
        actions={
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Åpne Stripe <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </a>
        }
      />

      {/* KPI-strip — 4 business-KPIer */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FinKpi
          label="MRR · coaching"
          value={`kr ${formatKr(mrrKr)}`}
          icon={Repeat}
          delta={proAktive > 0 ? `${proAktive} PRO-abonnement` : "Ingen PRO ennå"}
          tone={proAktive > 0 ? "up" : "flat"}
          accent
        />
        <FinKpi
          label="Innbetalt denne mnd"
          value={`kr ${formatNok(denneOre)}`}
          icon={endring < 0 ? TrendingDown : TrendingUp}
          delta={
            endring === 0 ? "Ingen sammenligning" : `${endring > 0 ? "+" : ""}${endring}% mot forrige`
          }
          tone={endring < 0 ? "down" : "up"}
        />
        <FinKpi
          label="Utestående"
          value={`kr ${formatNok(utestaendeOre)}`}
          icon={Flag}
          delta={`${utestaende._count} faktura ute`}
          tone={utestaendeOre > 0 ? "down" : "flat"}
        />
        <FinKpi
          label="Aktive abonnement"
          value={String(proAktive)}
          icon={Users}
          delta="PRO · 300 kr/mnd"
          tone="flat"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {/* Inntektsgraf */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-lg font-bold tracking-[-0.015em]">
                  Inntekt — siste <em className="font-normal italic text-primary">6 måneder</em>
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Beløp i kr · sum innbetalt per måned
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-6 items-end gap-3">
              {mndSerie.map((m, i) => {
                const hPct = (m.ore / maksOre) * 100;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative h-32 w-full">
                      <div
                        className={cn(
                          "absolute bottom-0 w-full rounded-t-sm transition-all",
                          m.erDenne ? "bg-accent" : "bg-primary/70",
                        )}
                        style={{ height: `${Math.max(hPct, 2)}%` }}
                      />
                    </div>
                    <div
                      className={cn(
                        "mt-2 font-mono text-[10px] uppercase tracking-[0.10em]",
                        m.erDenne ? "text-primary" : "text-muted-foreground",
                      )}
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
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-bold tracking-[-0.015em]">
                Siste <em className="font-normal italic text-primary">fakturaer</em>
              </h2>
              <Link
                href="/admin/finance"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Alle →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
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
                    <tr key={p.id} className="border-t border-border/60 hover:bg-secondary/40">
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
                      <td
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        Ingen transaksjoner ennå.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidekolonne — MRR-sammensetning + utestående */}
        <aside className="space-y-3">
          <section className="rounded-xl border border-border bg-card p-6">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              MRR-sammensetning
            </span>
            <div className="mt-3 font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
              kr {formatKr(mrrKr)}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              løpende per måned
            </div>
            {proAktive > 0 ? (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="inline-flex h-5 items-center rounded-md bg-accent px-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                    PRO
                  </span>
                  {proAktive} abonnement
                </span>
                <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                  kr {formatKr(mrrKr)}
                </span>
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-xs text-muted-foreground">
                Ingen aktive PRO-abonnement ennå. MRR vokser når spillere oppgraderer.
              </p>
            )}
          </section>

          {utestaendeOre > 0 && (
            <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-destructive">
                <Flag className="h-3 w-3" strokeWidth={2} aria-hidden /> Utestående
              </div>
              <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">
                kr {formatNok(utestaendeOre)}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {utestaende._count} faktura venter
              </div>
              <Link
                href="/admin/finance"
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-destructive/30 bg-card px-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-destructive hover:bg-destructive/10"
              >
                Følg opp
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} aria-hidden />
              </Link>
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
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "up" | "down" | "flat";
  icon: typeof Flag;
  accent?: boolean;
}) {
  const deltaClass =
    tone === "up" ? "text-success" : tone === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-card px-[18px] py-4",
        accent ? "border-accent/40" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md",
            accent ? "bg-accent text-primary" : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div className="font-mono text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
      </div>
      <div className={cn("font-mono text-[11px] font-bold tracking-[0.04em]", deltaClass)}>
        {delta}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const klass =
    status === "SUCCEEDED"
      ? "bg-success/10 text-success"
      : status === "FAILED" || status === "REFUNDED" || status === "PARTIALLY_REFUNDED"
        ? "bg-destructive/10 text-destructive"
        : "bg-accent/20 text-accent-foreground";
  return (
    <span
      className={cn(
        "rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em]",
        klass,
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children, mono = false }: { children?: React.ReactNode; mono?: boolean }) {
  return <td className={cn("px-4 py-2.5", mono && "font-mono tabular-nums")}>{children}</td>;
}
