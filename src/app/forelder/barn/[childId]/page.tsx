// Read-only barn-profil for forelder. Tab-navigasjon: oversikt / uke / mål / økonomi.
// Bruker URL-tab via ?tab= for server-render uten klient-state.

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Target,
  Star,
  TrendingUp,
  CreditCard,
  Activity,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertBarnTilhorerForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import type { PaymentStatus } from "@/generated/prisma/client";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const NB_KORT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

function paymentStatusLabel(s: PaymentStatus): {
  tekst: string;
  klasse: string;
} {
  if (s === "SUCCEEDED")
    return { tekst: "Betalt", klasse: "bg-primary/10 text-primary" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { tekst: "Refundert", klasse: "bg-muted text-muted-foreground" };
  if (s === "FAILED")
    return {
      tekst: "Feilet",
      klasse: "bg-destructive/10 text-destructive",
    };
  return { tekst: "Ubetalt", klasse: "bg-accent/30 text-accent-foreground" };
}

type Tab = "oversikt" | "uke" | "mal" | "okonomi";

const TABS: { key: Tab; label: string }[] = [
  { key: "oversikt", label: "Oversikt" },
  { key: "uke", label: "Uke" },
  { key: "mal", label: "Mål" },
  { key: "okonomi", label: "Økonomi" },
];

export default async function BarnProfil({
  params,
  searchParams,
}: {
  params: Promise<{ childId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const { childId } = await params;
  const sp = await searchParams;
  const tab: Tab = ["oversikt", "uke", "mal", "okonomi"].includes(sp.tab ?? "")
    ? (sp.tab as Tab)
    : "oversikt";

  const tilhorer = await assertBarnTilhorerForelder(user.id, childId);
  if (!tilhorer) notFound();

  const barn = await prisma.user.findUnique({
    where: { id: childId },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            orderBy: { scheduledAt: "desc" },
            take: 10,
            include: { log: { select: { rating: true, completedAt: true } } },
          },
        },
      },
      goals: {
        where: { status: "ACTIVE" },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      rounds: { orderBy: { playedAt: "desc" }, take: 10 },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!barn || barn.role !== "PLAYER") notFound();

  const aktivPlan = barn.trainingPlans[0] ?? null;

  // Aggregert uke-data (4 siste uker)
  const fireUkerSiden = new Date();
  fireUkerSiden.setDate(fireUkerSiden.getDate() - 28);
  const ukeLogger = await prisma.trainingPlanSessionLog.findMany({
    where: {
      completedAt: { gte: fireUkerSiden, not: null },
      session: { plan: { userId: childId } },
    },
    select: { completedAt: true, startedAt: true, rating: true },
    orderBy: { completedAt: "desc" },
  });

  const totalMinutter = ukeLogger.reduce((s, l) => {
    if (!l.completedAt || !l.startedAt) return s;
    return (
      s +
      Math.max(
        0,
        Math.round((l.completedAt.getTime() - l.startedAt.getTime()) / 60000),
      )
    );
  }, 0);
  const snittRating = (() => {
    const ratings = ukeLogger
      .map((l) => l.rating)
      .filter((r): r is number => r != null);
    if (ratings.length === 0) return null;
    return (
      Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) /
      10
    );
  })();

  const fornavn = barn.name.split(" ")[0] ?? barn.name;
  const etternavn = barn.name.split(" ").slice(1).join(" ");

  return (
    <div className="space-y-8">
      <Link
        href="/forelder/barn"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Mine barn
      </Link>

      <PageHeader
        eyebrow="Foreldreportal · Profil"
        titleLead={fornavn}
        titleItalic={etternavn || "profil"}
        sub={`HCP ${barn.hcp ?? "—"} · ${barn.homeClub ?? "Ingen hjemmeklubb"}`}
      />

      {/* Tabs */}
      <nav aria-label="Profilseksjoner" className="border-b border-border">
        <ul className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const aktiv = t.key === tab;
            return (
              <li key={t.key}>
                <Link
                  href={`/forelder/barn/${barn.id}?tab=${t.key}`}
                  aria-current={aktiv ? "page" : undefined}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    aktiv
                      ? "border-b-2 border-primary text-foreground"
                      : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Oversikt */}
      {tab === "oversikt" && (
        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <Calendar
                  className="h-3 w-3"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Aktiv plan
              </h2>
            </div>
            {!aktivPlan ? (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                Ingen aktiv plan.
              </div>
            ) : (
              <div className="px-6 py-4">
                <div className="font-display text-lg font-semibold">
                  {aktivPlan.name}
                </div>
                <ul className="mt-4 divide-y divide-border">
                  {aktivPlan.sessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-4 py-2 text-sm"
                    >
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {NB_DATO.format(s.scheduledAt)} · {s.pyramidArea} ·{" "}
                          {s.status}
                        </div>
                      </div>
                      {s.log?.rating != null ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          <Star
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          {s.log.rating}/5
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <TrendingUp
                  className="h-3 w-3"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Siste runder
              </h2>
            </div>
            {barn.rounds.length === 0 ? (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                Ingen runder registrert.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {barn.rounds.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                  >
                    <div className="font-semibold">
                      {NB_DATO.format(r.playedAt)}
                    </div>
                    <div className="font-mono text-xs tabular-nums text-muted-foreground">
                      Score {r.score}
                      {r.sgTotal != null
                        ? ` · SG ${r.sgTotal.toFixed(1)}`
                        : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Uke */}
      {tab === "uke" && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kpi
              icon={Activity}
              label="Økter · siste 28 dgr"
              value={String(ukeLogger.length)}
            />
            <Kpi
              icon={Calendar}
              label="Treningstid"
              value={`${Math.round(totalMinutter / 60)} t`}
              sub={`${totalMinutter} min totalt`}
            />
            <Kpi
              icon={Star}
              label="Snitt-rating"
              value={snittRating != null ? `${snittRating}/5` : "—"}
            />
          </section>

          <section className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-display text-base font-semibold tracking-tight">
                Logg{" "}
                <em className="font-normal italic text-muted-foreground">
                  · siste 4 uker
                </em>
              </h2>
            </div>
            {ukeLogger.length === 0 ? (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                Ingen registrerte økter siste 4 uker.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {ukeLogger.slice(0, 12).map((l, i) => {
                  const min =
                    l.completedAt && l.startedAt
                      ? Math.max(
                          0,
                          Math.round(
                            (l.completedAt.getTime() -
                              l.startedAt.getTime()) /
                              60000,
                          ),
                        )
                      : 0;
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                    >
                      <span className="font-mono text-xs tabular-nums">
                        {l.completedAt ? NB_KORT.format(l.completedAt) : "—"}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {min} min
                        {l.rating != null ? ` · ${l.rating}/5` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Mål */}
      {tab === "mal" && (
        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <Target
                className="h-3 w-3"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Aktive mål
            </h2>
          </div>
          {barn.goals.length === 0 ? (
            <div className="px-6 py-6 text-sm text-muted-foreground">
              Ingen mål satt.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {barn.goals.map((g) => (
                <li key={g.id} className="px-6 py-4 text-sm">
                  <div className="font-semibold">{g.title}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {g.type}
                    {g.targetValue != null ? ` · mål ${g.targetValue}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Økonomi */}
      {tab === "okonomi" && (
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
            <h2 className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <CreditCard
                className="h-3 w-3"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Betalinger
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {barn.payments.length} totalt
            </span>
          </div>
          {barn.payments.length === 0 ? (
            <div className="px-6 py-6 text-sm text-muted-foreground">
              Ingen fakturaer registrert.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {barn.payments.map((p) => {
                const st = paymentStatusLabel(p.status);
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {p.description ?? p.type}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {NB_KORT.format(p.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {ore(p.amountOre)}
                      </span>
                      <span
                        className={`rounded-full px-4 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${st.klasse}`}
                      >
                        {st.tekst}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
        {value}
      </div>
      {sub && (
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}
