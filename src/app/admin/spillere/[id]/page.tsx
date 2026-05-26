/**
 * CoachHQ — Spiller-detalj hovedside (`/admin/spillere/[id]`)
 *
 * Pixel-perfekt v2 (sesjon-1) — Variant A · tab-basert.
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 3.
 *
 * Refaktorert til DetailShell-mønster. Avatar-hero beholdes som children
 * i title-prop siden spillerens avatar er en identitets-komponent.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarPlus,
  ClipboardCheck,
  MessageSquare,
  MoreHorizontal,
  PenSquare,
} from "lucide-react";

import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui";
import { AthleticBadge } from "@/components/athletic";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { EffektTab, type EffektRad } from "./effekt-tab";
import { EnrollmentPanel } from "./enrollment-panel";

type TabKey = "profil" | "plan" | "tester" | "analyse" | "notater";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});
const NB_LONG = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
});

type Category = "A1" | "A2" | "B1" | "B2" | "C";

function deriveCategory(hcp: number | null): Category {
  if (hcp == null) return "C";
  if (hcp <= 0) return "A1";
  if (hcp <= 4) return "A2";
  if (hcp <= 10) return "B1";
  if (hcp <= 18) return "B2";
  return "C";
}

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function tierLabel(t: string): string {
  if (t === "PRO") return "PRO";
  if (t === "ELITE") return "ELITE";
  return "GRATIS";
}


function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default async function SpillerCoachView({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const sp = await searchParams;
  const validTabs: TabKey[] = ["profil", "plan", "tester", "analyse", "notater"];
  const tab: TabKey = validTabs.includes((sp.tab ?? "") as TabKey)
    ? (sp.tab as TabKey)
    : "profil";

  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            select: { id: true, status: true },
          },
        },
        take: 1,
      },
      rounds: {
        include: { course: { select: { name: true } } },
        orderBy: { playedAt: "desc" },
        take: 30,
      },
      testResults: {
        orderBy: { takenAt: "desc" },
        take: 20,
        include: { test: { select: { name: true } } },
      },
      childRelations: {
        include: {
          parent: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
      },
      goals: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      tournamentEntries: {
        where: { entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
        include: { tournament: { select: { name: true, startDate: true } } },
        orderBy: [{ manualDate: "asc" }],
        take: 1,
      },
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const sg = aggregateSg(player.rounds);
  const category = deriveCategory(player.hcp);
  const ageYears = calcAge(player.dateOfBirth);
  const baseHref = `/admin/spillere/${id}`;

  // Total tester (av testDefinition.count)
  const totalTester = await prisma.testDefinition.count();

  // Neste økt
  const nextSession = await prisma.trainingSessionV2.findFirst({
    where: {
      studentId: player.id,
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
  });

  // Coach-notater (siste 3) — via TrainingPlanSessionLog
  const recentCoachNotater = await prisma.trainingPlanSessionLog.findMany({
    where: {
      session: { plan: { userId: player.id } },
      coachFeedback: { not: null },
    },
    orderBy: { coachFeedbackAt: "desc" },
    take: 3,
    include: { session: { select: { title: true, pyramidArea: true } } },
  });

  // Enrolleringer — alle (aktive + historikk)
  const enrollments = await prisma.playerEnrollment.findMany({
    where: { userId: player.id },
    include: { coach: { select: { id: true, name: true } } },
    orderBy: { enrolledAt: "desc" },
  });

  // Coaches tilgjengelig for tildeling
  const coaches = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Plan-effektivitet (for analyse-tab)
  const effektRowsRaw = await prisma.planEffectiveness.findMany({
    where: { userId: player.id },
    orderBy: { computedAt: "desc" },
    include: {
      plan: { select: { name: true, startDate: true, endDate: true } },
      template: { select: { name: true } },
    },
  });
  const NB_KORT = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "short",
  });
  const effektRader: EffektRad[] = effektRowsRaw.map((r) => ({
    id: r.id,
    planId: r.planId,
    planName: r.plan.name,
    templateId: r.templateId,
    templateName: r.template?.name ?? null,
    periode: `${NB_KORT.format(r.plan.startDate)} – ${
      r.plan.endDate ? NB_KORT.format(r.plan.endDate) : "pågår"
    }`,
    computedAt: r.computedAt.toISOString(),
    completionRate: r.completionRate,
    sgTotalDelta: r.sgTotalDelta,
    sgOttDelta: r.sgOttDelta,
    sgAppDelta: r.sgAppDelta,
    sgArgDelta: r.sgArgDelta,
    sgPuttDelta: r.sgPuttDelta,
    selfRating: r.selfRating,
    coachRating: r.coachRating,
    notes: r.notes,
  }));

  const aktivPlan = player.trainingPlans[0] ?? null;
  const planTotal = aktivPlan?.sessions.length ?? 0;
  const planDone = aktivPlan
    ? aktivPlan.sessions.filter((s) => s.status === "COMPLETED").length
    : 0;

  const nesteTurnering = player.tournamentEntries[0] ?? null;
  const turneringsNavn =
    nesteTurnering?.tournament?.name ?? nesteTurnering?.manualName ?? null;
  const turneringsDato =
    nesteTurnering?.tournament?.startDate ?? nesteTurnering?.manualDate ?? null;

  const fornavn = player.name.split(" ")[0];
  const etternavn = player.name.split(" ").slice(1).join(" ") || "";

  // WAGR — sample (eksisterer ikke i DB ennå)
  // const wagrRank: number | null = null; // TODO: koble til WagrSnapshot

  return (
    <DetailShell
      breadcrumb={[
        { label: "Stallen", href: "/admin/stall" },
        { label: player.name },
      ]}
      backHref="/admin/stall"
      title={
        <span className="flex items-center gap-5">
          {player.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.avatarUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-xl font-semibold text-white"
              style={{ background: avatarBg(player.name) }}
            >
              {initialsFromName(player.name)}
            </span>
          )}
          <span>
            {fornavn}{" "}
            {etternavn && (
              <em className="text-primary italic">{etternavn}</em>
            )}
          </span>
        </span>
      }
      subtitle={`${player.homeClub ?? "Ingen klubb"} · HCP ${formatHcp(player.hcp)}${ageYears != null ? ` · ${ageYears} år` : ""}`}
      statusPill={
        <span className="flex items-center gap-2">
          <AthleticBadge
            variant={
              category === "A1" || category === "A2" ? "primary" : "neutral"
            }
          >
            {category}
          </AthleticBadge>
          <AthleticBadge variant={player.tier === "PRO" ? "primary" : "neutral"}>
            {tierLabel(player.tier)}
          </AthleticBadge>
        </span>
      }
      actions={
        <>
          <Link
            href={`/admin/innboks?tab=meldinger&to=${player.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <MessageSquare size={14} strokeWidth={1.75} />
            Send melding
          </Link>
          <Link
            href={`/admin/kalender?action=ny-okt&spiller=${player.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <CalendarPlus size={14} strokeWidth={1.75} />
            Ny økt
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary"
            aria-label="Flere handlinger"
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>
        </>
      }
      kpiRow={
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KPICard
            eyebrow="HCP-trend"
            value={formatHcp(player.hcp)}
            variant="hero"
            footnote="↓ 0,4 i mai"
          />
          <KPICard
            eyebrow="SG-total"
            value={sg.total != null ? formatSg(sg.total) : "—"}
            variant="default"
            footnote={`${sg.rundeAntall} runder snitt`}
          />
          <KPICard
            eyebrow="Tester"
            value={`${player.testResults.length}/${totalTester}`}
            variant="default"
            footnote={`${Math.round((player.testResults.length / Math.max(1, totalTester)) * 100)} % fullført`}
          />
          <KPICard
            eyebrow="Neste økt"
            value={
              nextSession
                ? nextSession.startTime.toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"
            }
            variant="default"
            footnote={
              nextSession
                ? `${NB_DATE.format(nextSession.startTime)} · ${nextSession.title.split(" ")[0]}`
                : "ingen planlagt"
            }
          />
        </div>
      }
      tabs={
        <nav
          role="tablist"
          aria-label="Spiller-tabs"
          className="flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1.5"
        >
          {([
            ["profil", "Profil", null],
            ["plan", "Plan", null],
            ["tester", "Tester", `${player.testResults.length}/${totalTester}`],
            ["analyse", "Analyse", null],
            ["notater", "Notater", null],
          ] as [TabKey, string, string | null][]).map(([key, label, count]) => {
            const aktiv = tab === key;
            return (
              <Link
                key={key}
                href={`${baseHref}?tab=${key}`}
                role="tab"
                aria-selected={aktiv}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  aktiv
                    ? "bg-accent text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                {count && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                      aktiv
                        ? "bg-primary text-accent"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      }
      stickyActions={
        <>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/spillere/${player.id}/tildel-test`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ClipboardCheck size={14} strokeWidth={1.75} />
              Tildel test
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/spillere/${player.id}/rediger`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <PenSquare size={14} strokeWidth={1.75} />
              Rediger
            </Link>
          </div>
        </>
      }
    >
      {/* Tab-innhold */}
      {tab === "profil" && (
        <>
          <EnrollmentPanel
            playerId={player.id}
            enrollments={enrollments.map((e) => ({
              id: e.id,
              program: e.program,
              coachId: e.coachId,
              coachName: e.coach?.name ?? null,
              enrolledAt: e.enrolledAt,
              endedAt: e.endedAt,
              notes: e.notes,
            }))}
            coaches={coaches}
          />
          <ProfilTab
            player={player}
            parents={player.childRelations.map((cr) => cr.parent)}
            coachNotater={recentCoachNotater.map((n) => ({
              id: n.id,
              title: n.session.title,
              text: n.coachFeedback ?? "",
              date: n.coachFeedbackAt ?? new Date(),
            }))}
            ageYears={ageYears}
          />
        </>
      )}
      {tab === "plan" && (
        <PlanTab
          aktivPlanName={aktivPlan?.name ?? null}
          done={planDone}
          total={planTotal}
          turneringsNavn={turneringsNavn}
          turneringsDato={turneringsDato}
          baseHref={baseHref}
        />
      )}
      {tab === "tester" && (
        <TesterTab
          tester={player.testResults.map((t) => ({
            id: t.id,
            name: t.test.name,
            date: t.takenAt,
            score: t.score,
          }))}
          total={totalTester}
        />
      )}
      {tab === "analyse" && <EffektTab rader={effektRader} />}
      {tab === "notater" && (
        <NotaterTab
          notater={recentCoachNotater.map((n) => ({
            id: n.id,
            title: n.session.title,
            area: n.session.pyramidArea,
            text: n.coachFeedback ?? "",
            date: n.coachFeedbackAt ?? new Date(),
          }))}
        />
      )}
    </DetailShell>
  );
}

// ---------- PROFIL-TAB ----------

function ProfilTab({
  player,
  parents,
  coachNotater,
  ageYears,
}: {
  player: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    homeClub: string | null;
    dateOfBirth: Date | null;
    ambition: string | null;
    createdAt: Date;
  };
  parents: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    avatarUrl: string | null;
  }[];
  coachNotater: { id: string; title: string; text: string; date: Date }[];
  ageYears: number | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      {/* Hoved-innhold */}
      <div className="space-y-4">
        {/* Personalia */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Personalia
              </div>
              <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
                Stamdata
              </h2>
            </div>
            <Link
              href={`/admin/spillere/${player.id}/profil`}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
            >
              Full profil →
            </Link>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Fact label="Navn" value={player.name} />
            <Fact label="E-post" value={player.email} mono />
            <Fact
              label="Fødselsdato"
              value={
                player.dateOfBirth
                  ? `${NB_LONG.format(player.dateOfBirth)}${ageYears != null ? ` · ${ageYears} år` : ""}`
                  : "—"
              }
            />
            <Fact label="Telefon" value={player.phone ?? "—"} mono />
            <Fact label="Klubb" value={player.homeClub ?? "—"} />
            <Fact
              label="Medlem siden"
              value={NB_LONG.format(player.createdAt)}
            />
          </dl>
        </section>

        {/* Forelder/verge */}
        {parents.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Forelder / verge
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {parents.length}
              </span>
            </div>
            <ul className="space-y-3">
              {parents.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-10 w-10 place-items-center rounded-full font-mono text-xs font-semibold text-white"
                      style={{ background: avatarBg(p.name) }}
                    >
                      {initialsFromName(p.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {p.name}
                    </div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {p.phone ?? p.email}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                    Stripe-betaler
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Aktivitet-tidslinje (siste 30 dager) */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Aktivitet · siste 30 dager
              </div>
              <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
                Tidslinje
              </h2>
            </div>
          </div>
          <ul className="space-y-3">
            {/* Sample event-stream — full impl bygges når data finnes */}
            <TimelineEvent
              dot="primary"
              title="Putt-økt fullført · 45 min"
              meta="i dag, 11:00 · Mulligan Studio"
            />
            <TimelineEvent
              dot="accent"
              title="Test gjennomført · CS70"
              meta="i går, 14:30"
            />
            <TimelineEvent
              dot="warning"
              title="Runde · GFGK · 74"
              meta="20. mai"
            />
            <TimelineEvent
              dot="muted"
              title="Meldte seg på Sørlandsåpent"
              meta="18. mai"
            />
          </ul>
        </section>
      </div>

      {/* Sidekol — Coach-notater */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Coach-notater
          </div>
          {coachNotater.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen notater ennå.</p>
          ) : (
            <ul className="space-y-4">
              {coachNotater.map((n) => (
                <li
                  key={n.id}
                  className="border-l-2 border-accent pl-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {n.title}
                    </span>
                    <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {NB_DATE.format(n.date)}
                    </time>
                  </div>
                  <p
                    className="mt-2 text-sm leading-relaxed text-foreground"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontStyle: "italic",
                    }}
                  >
                    &laquo;{n.text}&raquo;
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}

// ---------- PLAN-TAB ----------

function PlanTab({
  aktivPlanName,
  done,
  total,
  turneringsNavn,
  turneringsDato,
  baseHref,
}: {
  aktivPlanName: string | null;
  done: number;
  total: number;
  turneringsNavn: string | null;
  turneringsDato: Date | null;
  baseHref: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Aktiv treningsplan
        </div>
        {aktivPlanName ? (
          <>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">
              <em className="font-display italic font-normal text-primary">
                {aktivPlanName}
              </em>
            </h3>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <span>
                  {done}/{total} økter
                </span>
                <span>{pct} %</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Ingen aktiv plan.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Neste turnering
        </div>
        {turneringsNavn ? (
          <>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">
              {turneringsNavn}
            </h3>
            {turneringsDato && (
              <p className="mt-2 font-mono text-sm tabular-nums text-muted-foreground">
                {NB_LONG.format(turneringsDato)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Ingen påmeldt.
          </p>
        )}
      </section>

      <div className="lg:col-span-2">
        <Link
          href={`${baseHref}?tab=analyse`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
        >
          Se plan-effektivitet →
        </Link>
      </div>
    </div>
  );
}

// ---------- TESTER-TAB ----------

function TesterTab({
  tester,
  total,
}: {
  tester: { id: string; name: string; date: Date; score: number | null }[];
  total: number;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Tester · {tester.length}/{total}
        </div>
      </div>
      {tester.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Ingen testresultater registrert.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {tester.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {t.name}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {NB_LONG.format(t.date)}
                </div>
              </div>
              {t.score != null && (
                <div className="font-mono text-lg font-semibold tabular-nums text-primary">
                  {t.score}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- NOTATER-TAB ----------

function NotaterTab({
  notater,
}: {
  notater: {
    id: string;
    title: string;
    area: string;
    text: string;
    date: Date;
  }[];
}) {
  if (notater.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Ingen coach-notater registrert.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <ul className="space-y-4">
        {notater.map((n) => (
          <li key={n.id} className="border-l-2 border-accent pl-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-semibold text-foreground">
                {n.title} · {n.area}
              </span>
              <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {NB_DATE.format(n.date)}
              </time>
            </div>
            <p
              className="mt-2 text-base leading-relaxed text-foreground"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
              }}
            >
              &laquo;{n.text}&raquo;
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Hjelpekomponenter ----------

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-foreground ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function TimelineEvent({
  dot,
  title,
  meta,
}: {
  dot: "primary" | "accent" | "warning" | "muted";
  title: string;
  meta: string;
}) {
  const dotClass: Record<typeof dot, string> = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    muted: "bg-muted-foreground",
  };
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass[dot]}`}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {meta}
        </div>
      </div>
    </li>
  );
}

