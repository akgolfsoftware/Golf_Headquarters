/**
 * CoachHQ — Spiller-detalj hovedside (`/admin/spillere/[id]`)
 *
 * Pixel-perfekt v2 (sesjon-1) — Variant A · tab-basert.
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 3.
 *
 * Hero (avatar + navn italic + pills + action-knapper) → 5 tabs → 4-KPI → tab-innhold.
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

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { EffektTab, type EffektRad } from "./effekt-tab";

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

const CAT_STYLE: Record<Category, string> = {
  A1: "bg-[#005840] text-[#D1F843]",
  A2: "bg-[#D1F843] text-[#005840]",
  B1: "bg-[#F1EEE5] text-[#0A1F17]",
  B2: "bg-[#F1EEE5] text-[#5E5C57]",
  C: "bg-[#F1EEE5] text-[#5E5C57]",
};

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

function tierStyle(t: string): string {
  if (t === "PRO") return "bg-[#005840] text-[#D1F843]";
  if (t === "ELITE") return "bg-[#D1F843] text-[#005840]";
  return "bg-[#F1EEE5] text-[#5E5C57]";
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
  const wagrRank: number | null = null;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <header className="rounded-2xl border border-[#E5E3DD] bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            {player.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.avatarUrl}
                alt=""
                className="h-24 w-24 shrink-0 rounded-full object-cover sm:h-28 sm:w-28"
              />
            ) : (
              <div
                className="grid h-24 w-24 shrink-0 place-items-center rounded-full font-display text-3xl font-semibold text-white sm:h-28 sm:w-28"
                style={{ background: avatarBg(player.name) }}
              >
                {initialsFromName(player.name)}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                COACHHQ · STALLEN
              </div>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-[#0A1F17] sm:text-4xl">
                {fornavn}{" "}
                {etternavn && (
                  <em
                    className="font-normal not-italic"
                    style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontStyle: "italic",
                      color: "#005840",
                    }}
                  >
                    {etternavn}
                  </em>
                )}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${CAT_STYLE[category]}`}
                >
                  {category}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#F1EEE5] px-3 py-1 font-mono text-[11px] font-semibold tabular-nums text-[#0A1F17]">
                  HCP {formatHcp(player.hcp)}
                </span>
                {wagrRank != null && (
                  <span className="inline-flex items-center rounded-full bg-[#F1EEE5] px-3 py-1 font-mono text-[11px] font-semibold tabular-nums text-[#0A1F17]">
                    WAGR {wagrRank}
                  </span>
                )}
                {ageYears != null && (
                  <span className="inline-flex items-center rounded-full bg-[#F1EEE5] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5E5C57]">
                    {ageYears} år
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${tierStyle(player.tier)}`}
                >
                  {tierLabel(player.tier)}
                </span>
              </div>
            </div>
          </div>

          {/* Action-knapper */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/innboks?tab=meldinger&to=${player.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E3DD] bg-card px-4 py-2 text-sm font-medium text-[#0A1F17] transition-colors hover:bg-[#F1EEE5]"
            >
              <MessageSquare size={14} strokeWidth={1.75} />
              Send melding
            </Link>
            <Link
              href={`/admin/spillere/${player.id}/tildel-test`}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E3DD] bg-card px-4 py-2 text-sm font-medium text-[#0A1F17] transition-colors hover:bg-[#F1EEE5]"
            >
              <ClipboardCheck size={14} strokeWidth={1.75} />
              Tildel test
            </Link>
            <Link
              href={`/admin/kalender?action=ny-okt&spiller=${player.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#005840] px-4 py-2 text-sm font-semibold text-[#D1F843] transition-colors hover:opacity-90"
            >
              <CalendarPlus size={14} strokeWidth={1.75} />
              Ny økt
            </Link>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#E5E3DD] bg-card text-[#5E5C57] hover:bg-[#F1EEE5]"
              aria-label="Flere handlinger"
            >
              <MoreHorizontal size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* 5 TABS (lime accent active) */}
      <nav
        role="tablist"
        aria-label="Spiller-tabs"
        className="flex items-center gap-1 overflow-x-auto rounded-full border border-[#E5E3DD] bg-card p-1.5"
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
                  ? "bg-[#D1F843] text-[#005840] shadow-sm"
                  : "text-[#5E5C57] hover:text-[#0A1F17]"
              }`}
            >
              <span>{label}</span>
              {count && (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                    aktiv
                      ? "bg-[#005840] text-[#D1F843]"
                      : "bg-[#F1EEE5] text-[#5E5C57]"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 4-KPI-STRIP */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile
          eyebrow="HCP-trend"
          value={formatHcp(player.hcp)}
          sub="↓ 0,4 i mai"
          accent
        />
        <KpiTile
          eyebrow="SG-total"
          value={sg.total != null ? formatSg(sg.total) : "—"}
          sub={`${sg.rundeAntall} runder snitt`}
        />
        <KpiTile
          eyebrow="Tester"
          value={`${player.testResults.length}/${totalTester}`}
          sub={`${Math.round((player.testResults.length / Math.max(1, totalTester)) * 100)} % fullført`}
        />
        <KpiTile
          eyebrow="Neste økt"
          value={
            nextSession
              ? nextSession.startTime.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
          sub={
            nextSession
              ? `${NB_DATE.format(nextSession.startTime)} · ${nextSession.title.split(" ")[0]}`
              : "ingen planlagt"
          }
        />
      </section>

      {/* TAB-INNHOLD */}
      {tab === "profil" && (
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

      {/* Bunn-CTA-bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CtaBtn
          href={`/admin/innboks?tab=meldinger&to=${player.id}`}
          icon={MessageSquare}
          label="Send melding"
          primary
        />
        <CtaBtn
          href={`/admin/spillere/${player.id}/tildel-test`}
          icon={ClipboardCheck}
          label="Tildel test"
        />
        <CtaBtn
          href={`/admin/kalender?action=ny-okt&spiller=${player.id}`}
          icon={CalendarPlus}
          label="Ny økt"
        />
        <CtaBtn
          href={`/admin/spillere/${player.id}/rediger`}
          icon={PenSquare}
          label="Rediger"
        />
      </div>
    </div>
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
        <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                Personalia
              </div>
              <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
                Stamdata
              </h2>
            </div>
            <Link
              href={`/admin/spillere/${player.id}/profil`}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#005840] hover:underline"
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
          <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                Forelder / verge
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                {parents.length}
              </span>
            </div>
            <ul className="space-y-3">
              {parents.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-[#E5E3DD] bg-[#FAFAF7] p-3"
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
                    <div className="truncate text-sm font-semibold text-[#0A1F17]">
                      {p.name}
                    </div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                      {p.phone ?? p.email}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#005840]/10 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#005840]">
                    Stripe-betaler
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Aktivitet-tidslinje (siste 30 dager) */}
        <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                Aktivitet · siste 30 dager
              </div>
              <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
                Tidslinje
              </h2>
            </div>
          </div>
          <ul className="space-y-3">
            {/* Sample event-stream — full impl bygges når data finnes */}
            <TimelineEvent
              dot="#005840"
              title="Putt-økt fullført · 45 min"
              meta="i dag, 11:00 · Mulligan Studio"
            />
            <TimelineEvent
              dot="#D1F843"
              title="Test gjennomført · CS70"
              meta="i går, 14:30"
            />
            <TimelineEvent
              dot="#B8852A"
              title="Runde · GFGK · 74"
              meta="20. mai"
            />
            <TimelineEvent
              dot="#5E5C57"
              title="Meldte seg på Sørlandsåpent"
              meta="18. mai"
            />
          </ul>
        </section>
      </div>

      {/* Sidekol — Coach-notater */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
            Coach-notater
          </div>
          {coachNotater.length === 0 ? (
            <p className="text-sm text-[#5E5C57]">Ingen notater ennå.</p>
          ) : (
            <ul className="space-y-4">
              {coachNotater.map((n) => (
                <li
                  key={n.id}
                  className="border-l-2 border-[#D1F843] pl-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[#0A1F17]">
                      {n.title}
                    </span>
                    <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                      {NB_DATE.format(n.date)}
                    </time>
                  </div>
                  <p
                    className="mt-2 text-sm leading-relaxed text-[#0A1F17]"
                    style={{
                      fontFamily: "'Instrument Serif', serif",
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
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
          Aktiv treningsplan
        </div>
        {aktivPlanName ? (
          <>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[#0A1F17]">
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  color: "#005840",
                }}
              >
                {aktivPlanName}
              </em>
            </h3>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                <span>
                  {done}/{total} økter
                </span>
                <span>{pct} %</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#F1EEE5]">
                <div
                  className="h-full rounded-full bg-[#005840]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-[#E5E3DD] p-4 text-sm text-[#5E5C57]">
            Ingen aktiv plan.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
          Neste turnering
        </div>
        {turneringsNavn ? (
          <>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[#0A1F17]">
              {turneringsNavn}
            </h3>
            {turneringsDato && (
              <p className="mt-2 font-mono text-sm tabular-nums text-[#5E5C57]">
                {NB_LONG.format(turneringsDato)}
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-[#E5E3DD] p-4 text-sm text-[#5E5C57]">
            Ingen påmeldt.
          </p>
        )}
      </section>

      <div className="lg:col-span-2">
        <Link
          href={`${baseHref}?tab=analyse`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#005840] hover:underline"
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
    <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
          Tester · {tester.length}/{total}
        </div>
      </div>
      {tester.length === 0 ? (
        <p className="rounded-md border border-dashed border-[#E5E3DD] p-6 text-center text-sm text-[#5E5C57]">
          Ingen testresultater registrert.
        </p>
      ) : (
        <ul className="divide-y divide-[#E5E3DD]">
          {tester.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#0A1F17]">
                  {t.name}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                  {NB_LONG.format(t.date)}
                </div>
              </div>
              {t.score != null && (
                <div className="font-mono text-lg font-semibold tabular-nums text-[#005840]">
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
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-8 text-center">
        <p className="text-sm text-[#5E5C57]">Ingen coach-notater registrert.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
      <ul className="space-y-4">
        {notater.map((n) => (
          <li key={n.id} className="border-l-2 border-[#D1F843] pl-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-semibold text-[#0A1F17]">
                {n.title} · {n.area}
              </span>
              <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                {NB_DATE.format(n.date)}
              </time>
            </div>
            <p
              className="mt-2 text-base leading-relaxed text-[#0A1F17]"
              style={{
                fontFamily: "'Instrument Serif', serif",
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

function KpiTile({
  eyebrow,
  value,
  sub,
  accent,
}: {
  eyebrow: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E3DD] bg-card p-5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
        {eyebrow}
      </div>
      <div
        className={`mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums ${
          accent ? "text-[#005840]" : "text-[#0A1F17]"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
        {sub}
      </div>
    </div>
  );
}

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
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-[#0A1F17] ${mono ? "font-mono tabular-nums" : ""}`}
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
  dot: string;
  title: string;
  meta: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: dot }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#0A1F17]">{title}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
          {meta}
        </div>
      </div>
    </li>
  );
}

function CtaBtn({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: typeof MessageSquare;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${
        primary
          ? "border-[#005840] bg-[#005840] text-[#D1F843] hover:opacity-90"
          : "border-[#E5E3DD] bg-card text-[#0A1F17] hover:bg-[#F1EEE5]"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span>{label}</span>
    </Link>
  );
}
