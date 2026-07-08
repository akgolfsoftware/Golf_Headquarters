// Read-only barn-profil for forelder. Tab-navigasjon: oversikt / uke / mål / økonomi.
// Hybrid design: forest-gradient hero + white cards. URL-tab via ?tab= for server-render.

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
  Flag,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertBarnTilhorerForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
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
    return { tekst: "Feilet", klasse: "bg-destructive/10 text-destructive" };
  return { tekst: "Ubetalt", klasse: "bg-accent/30 text-accent-foreground" };
}

type Tab = "oversikt" | "uke" | "mal" | "okonomi";

const TABS: { key: Tab; label: string }[] = [
  { key: "oversikt", label: "OVERSIKT" },
  { key: "uke", label: "UKE" },
  { key: "mal", label: "MÅL" },
  { key: "okonomi", label: "ØKONOMI" },
];

const PYRAMID_AREAS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
type PyramidArea = (typeof PYRAMID_AREAS)[number];

const PYRAMID_COLORS: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

const PYRAMID_LABELS: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slagspill",
  SPILL: "Spill",
  TURN: "Turnering",
};

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

  // Initialer
  const navnDeler = barn.name.trim().split(" ");
  const initialer =
    navnDeler.length >= 2
      ? `${navnDeler[0][0]}${navnDeler[navnDeler.length - 1][0]}`.toUpperCase()
      : barn.name.slice(0, 2).toUpperCase();

  // HCP-visning
  const hcpStr = barn.hcp != null ? barn.hcp.toFixed(1) : "—";

  // Tier fra første aktive plan (eller «PlayerHQ»)
  const tierLabel = "PlayerHQ";

  // Antall runder
  const antallRunder = barn.rounds.length;

  // Gjennomsnitt SG
  const sgRunder = barn.rounds.filter((r) => r.sgTotal != null);
  const avgSg =
    sgRunder.length > 0
      ? (
          sgRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sgRunder.length
        ).toFixed(2)
      : "—";

  // Pyramide-data
  const sessionsPerArea = new Map<string, number>();
  for (const s of aktivPlan?.sessions ?? []) {
    sessionsPerArea.set(
      s.pyramidArea,
      (sessionsPerArea.get(s.pyramidArea) ?? 0) + 1,
    );
  }
  const totSessions = Math.max(aktivPlan?.sessions.length ?? 0, 1);

  const pyramidData = PYRAMID_AREAS.map((area) => ({
    area,
    pct: Math.round(((sessionsPerArea.get(area) ?? 0) / totSessions) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Tilbake-lenke */}
      <Link
        href="/forelder/barn"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        Mine barn
      </Link>

      {/* Hero forest card — uses primary token + text-white for contrast */}
      <div className="rounded-2xl bg-primary p-6 text-white">
        {/* Avatar + navn */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full"
            style={{
              background: "var(--primary)",
              border: "2px solid var(--accent)",
            }}
          >
            <span className="font-mono text-base font-bold text-accent">
              {initialer}
            </span>
          </div>
          <div>
            <div className="font-display text-lg font-bold text-white">
              {barn.name}
            </div>
            <div
              className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              HCP {hcpStr} · {tierLabel} · {barn.homeClub ?? "Ingen hjemmeklubb"}
            </div>
          </div>
        </div>

        {/* KPI-grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "HCP", value: hcpStr },
            { label: "Runder", value: String(antallRunder) },
            { label: "Snitt SG", value: avgSg },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-3 text-center"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <div
                className="font-mono text-[9px] uppercase tracking-[0.10em]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {label}
              </div>
              <div className="mt-1 font-mono text-xl font-bold tabular-nums text-accent">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pyramide-balanse */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-[15px] font-bold text-foreground">
          Pyramide-balanse
        </h2>
        <div className="mt-4 space-y-3">
          {pyramidData.map(({ area, pct }) => (
            <div key={area}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                  {PYRAMID_LABELS[area]}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${PYRAMID_COLORS[area]} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {aktivPlan === null && (
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            Ingen aktiv plan — data ikke tilgjengelig
          </p>
        )}
      </div>

      {/* Sesongmål · fremdrift */}
      {barn.goals.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">
            Sesongmål · fremdrift
          </h2>
          <div className="mt-4 space-y-4">
            {barn.goals.slice(0, 5).map((g) => (
              <div key={g.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {g.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                      {g.type}
                      {g.targetValue != null ? ` · mål ${g.targetValue}` : ""}
                    </div>
                  </div>
                  <Flag
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                {/* Fremdrifts-bar — placeholder (ingen currentValue i modellen) */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "40%",
                      background: "linear-gradient(90deg,var(--primary),var(--accent))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab-navigasjon */}
      <nav aria-label="Profilseksjoner" className="border-b border-border">
        <ul className="flex gap-0">
          {TABS.map((t) => {
            const aktiv = t.key === tab;
            return (
              <li key={t.key}>
                <Link
                  href={`/forelder/barn/${barn.id}?tab=${t.key}`}
                  aria-current={aktiv ? "page" : undefined}
                  className={`inline-flex items-center px-4 py-3 font-mono text-[10px] tracking-[0.10em] transition-colors ${
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
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Aktiv plan
              </h2>
            </div>
            {!aktivPlan ? (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                Ingen aktiv plan.
              </div>
            ) : (
              <div className="px-6 py-4">
                <div className="font-display text-base font-semibold text-foreground">
                  {aktivPlan.name}
                </div>
                <ul className="mt-4 divide-y divide-border">
                  {aktivPlan.sessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {s.title}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {NB_DATO.format(s.scheduledAt)} · {s.pyramidArea} ·{" "}
                          {s.status}
                        </div>
                      </div>
                      {s.log?.rating != null ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary">
                          <Star className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                          {s.log.rating}/5
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
                    className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                  >
                    <div className="font-semibold text-foreground">
                      {NB_DATO.format(r.playedAt)}
                    </div>
                    <div className="font-mono text-xs tabular-nums text-muted-foreground">
                      Score {r.score}
                      {r.sgTotal != null ? ` · SG ${r.sgTotal.toFixed(1)}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Uke */}
      {tab === "uke" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <HybridKpi
              icon={Activity}
              label="Økter · siste 28 dgr"
              value={String(ukeLogger.length)}
            />
            <HybridKpi
              icon={Calendar}
              label="Treningstid"
              value={`${Math.round(totalMinutter / 60)} t`}
              sub={`${totalMinutter} min totalt`}
            />
            <HybridKpi
              icon={Star}
              label="Snitt-rating"
              value={snittRating != null ? `${snittRating}/5` : "—"}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-display text-[15px] font-bold text-foreground">
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
                      className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                    >
                      <span className="font-mono text-xs tabular-nums text-foreground">
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
          </div>
        </div>
      )}

      {/* Mål */}
      {tab === "mal" && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <Target className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
                  <div className="font-semibold text-foreground">{g.title}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {g.type}
                    {g.targetValue != null ? ` · mål ${g.targetValue}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Økonomi */}
      {tab === "okonomi" && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Betalinger
              </h2>
            </div>
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
                      <div className="truncate font-semibold text-foreground">
                        {p.description ?? p.type}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {NB_KORT.format(p.createdAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {ore(p.amountOre)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${st.klasse}`}
                      >
                        {st.tekst}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function HybridKpi({
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">
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
