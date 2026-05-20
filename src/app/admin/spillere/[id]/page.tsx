/**
 * CoachHQ — Coach-view av én spiller (`/admin/spillere/[id]`).
 *
 * Komplett detalj-visning for coach Anders. Speilfortet av PlayerHQ-profilen
 * men optimalisert for coachens beslutninger:
 *   - Hero med portrett + identitet + status
 *   - KPI-strip: SG-Total · Snitt-score · Streak · Mål-fremdrift
 *   - Tabs: Oversikt · Treningsplan · Statistikk · Mål · Notater · Innboks
 *   - Quick actions: Send melding · Lag plan · Be om feedback · Logg coach-notat
 *
 * For PlayerHQ-spillerprofil (sluttbruker), se /portal/profil.
 * For dyp 360-analyse (lagacy), se /admin/elever/[id] — denne ruten skal på
 * sikt erstatte den, men koeksisterer i overgangsfasen.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Flag,
  Inbox,
  Layers,
  LineChart as LineChartIcon,
  MessageSquare,
  NotebookPen,
  PenSquare,
  Target,
  Trophy,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { computeStreak, aktivStreak } from "@/lib/streak";
import { ProfilRedigerTrigger } from "@/components/shared/profil-rediger-trigger";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";

type TabKey =
  | "oversikt"
  | "treningsplan"
  | "statistikk"
  | "mal"
  | "notater"
  | "innboks";

const TABS: { key: TabKey; label: string; icon: typeof Target }[] = [
  { key: "oversikt", label: "Oversikt", icon: Target },
  { key: "treningsplan", label: "Treningsplan", icon: ClipboardList },
  { key: "statistikk", label: "Statistikk", icon: LineChartIcon },
  { key: "mal", label: "Mål", icon: Flag },
  { key: "notater", label: "Notater", icon: NotebookPen },
  { key: "innboks", label: "Innboks", icon: Inbox },
];

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
  A1: "bg-primary/15 text-primary",
  A2: "bg-accent/40 text-accent-foreground",
  B1: "bg-secondary text-foreground",
  B2: "bg-muted text-muted-foreground",
  C: "bg-muted text-muted-foreground",
};

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function tierLabel(t: string): string {
  if (t === "PRO") return "Pro";
  if (t === "ELITE") return "Elite";
  return "Free";
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

  const tab: TabKey = (TABS.map((t) => t.key) as string[]).includes(
    sp.tab ?? "",
  )
    ? (sp.tab as TabKey)
    : "oversikt";

  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      trainingPlans: {
        include: {
          sessions: {
            select: {
              id: true,
              title: true,
              status: true,
              scheduledAt: true,
              pyramidArea: true,
              durationMin: true,
              log: {
                select: {
                  startedAt: true,
                  completedAt: true,
                  coachFeedback: true,
                  coachFeedbackAt: true,
                  csAchieved: true,
                  rating: true,
                },
              },
            },
            orderBy: { scheduledAt: "desc" },
          },
        },
        orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
      },
      rounds: {
        include: { course: { select: { name: true } } },
        orderBy: { playedAt: "desc" },
        take: 30,
      },
      goals: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      tournamentEntries: {
        where: { entryStatus: "PLANNED" },
        include: {
          tournament: { select: { name: true, startDate: true } },
        },
        orderBy: [{ manualDate: "asc" }],
        take: 5,
      },
      groupMemberships: {
        select: { group: { select: { name: true } } },
        take: 1,
      },
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const sg = aggregateSg(player.rounds);
  const category = deriveCategory(player.hcp);

  const allSessions = player.trainingPlans.flatMap((p) =>
    p.sessions.map((s) => ({
      ...s,
      planName: p.name,
      planId: p.id,
      planStatus: p.status,
      planIsActive: p.isActive,
    })),
  );

  const completedSessions = allSessions.filter(
    (s) => s.status === "COMPLETED",
  );
  const plannedSessions = allSessions.filter(
    (s) => s.status !== "COMPLETED" && s.status !== "CANCELLED",
  );
  const totalSessions = allSessions.length;
  const progressPct =
    totalSessions > 0
      ? Math.round((completedSessions.length / totalSessions) * 100)
      : 0;

  // Streak (14 dager bakover, basert på fullførte sesjon-logger)
  const loggDates = completedSessions
    .map((s) => s.log?.startedAt ?? s.scheduledAt)
    .filter((d): d is Date => d != null);
  const streak14 = computeStreak(loggDates, 14);
  const streakAktiv = aktivStreak(streak14);

  // Aktiv plan
  const aktivPlan = player.trainingPlans.find((p) => p.isActive);

  // Neste turnering
  const nesteTurnering = player.tournamentEntries[0];
  const turneringsDato =
    nesteTurnering?.tournament?.startDate ?? nesteTurnering?.manualDate ?? null;
  const naaTs = new Date().getTime();
  const dagerTilTurnering =
    turneringsDato != null
      ? Math.max(
          0,
          Math.ceil(
            (turneringsDato.getTime() - naaTs) / (1000 * 60 * 60 * 24),
          ),
        )
      : null;
  const turneringsNavn =
    nesteTurnering?.tournament?.name ?? nesteTurnering?.manualName ?? null;

  // Mål-fremdrift (snitt av aktive mål med targetValue)
  const malMedFremdrift = player.goals.filter(
    (g) => g.targetValue != null,
  );
  // Vi har ikke currentValue lagret — bruk progressPct som proxy hvis ingen mål.
  const malFremdriftPct = malMedFremdrift.length > 0 ? progressPct : progressPct;

  // Sesjon-historie siste 30 dager (kalender-strip)
  const naa = new Date();
  const dager30: { dato: Date; antall: number; pyramide: string | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(naa);
    d.setDate(naa.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const okter = completedSessions.filter((s) => {
      const sd = s.log?.startedAt ?? s.scheduledAt;
      return (
        sd.getFullYear() === d.getFullYear() &&
        sd.getMonth() === d.getMonth() &&
        sd.getDate() === d.getDate()
      );
    });
    dager30.push({
      dato: d,
      antall: okter.length,
      pyramide: okter[0]?.pyramidArea ?? null,
    });
  }

  // Pyramide-balanse (5 ringer) — minutter per område siste 12 uker
  const tolvUkerSiden = new Date(naa);
  tolvUkerSiden.setDate(naa.getDate() - 84);
  const pyrMin: Record<string, number> = {
    FYS: 0,
    TEK: 0,
    SLAG: 0,
    SPILL: 0,
    TURN: 0,
  };
  for (const s of completedSessions) {
    if (s.scheduledAt < tolvUkerSiden) continue;
    if (s.pyramidArea in pyrMin) {
      pyrMin[s.pyramidArea] += s.durationMin;
    }
  }
  const pyrTotal = Object.values(pyrMin).reduce((a, b) => a + b, 0);

  // Coach-notater (3 siste)
  const coachNotater = completedSessions
    .filter(
      (s) =>
        s.log?.coachFeedback != null &&
        s.log.coachFeedback.trim().length > 0 &&
        s.log.coachFeedbackAt != null,
    )
    .sort(
      (a, b) =>
        (b.log!.coachFeedbackAt as Date).getTime() -
        (a.log!.coachFeedbackAt as Date).getTime(),
    )
    .slice(0, 3);

  const sisteRundeScore = player.rounds[0]?.score;

  const baseHref = `/admin/spillere/${id}`;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <header className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[112px_1fr_auto] sm:items-center">
        <PlayerAvatar
          src={player.avatarUrl}
          name={player.name}
          size={112}
        />
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · Stallen
          </span>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-[36px]">
            {player.name.split(" ")[0]}{" "}
            <em className="font-normal italic text-primary">
              {player.name.split(" ").slice(1).join(" ") || player.name}
            </em>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${CAT_STYLE[category]}`}
            >
              {category}
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground">
              {tierLabel(player.tier)}
            </span>
            {player.homeClub && (
              <>
                <span className="text-border">·</span>
                <span>{player.homeClub}</span>
              </>
            )}
            <span className="text-border">·</span>
            <StatusBadge daysSinceLogin={daysSinceLogin(player.lastLoginAt)} />
          </div>
          {player.ambition && (
            <p className="mt-3 max-w-2xl text-[13px] leading-[1.5] text-foreground/80">
              {player.ambition}
            </p>
          )}
        </div>

        {/* HCP-stat tett mot navn på hero — visuell ankerpunkt */}
        <div className="flex gap-8 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="text-center">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              HCP
            </div>
            <div className="mt-1.5 font-mono text-[32px] font-semibold leading-none tabular-nums text-foreground">
              {formatHcp(player.hcp)}
            </div>
          </div>
        </div>
      </header>

      {/* KPI-STRIP */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="SG-Total"
          value={sg.total != null ? formatSg(sg.total) : "—"}
          sub={`${sg.rundeAntall} runder snitt`}
          tone={sg.total != null && sg.total > 0 ? "positive" : "neutral"}
          icon={LineChartIcon}
        />
        <Kpi
          label="Snitt-score"
          value={
            sg.snittScore != null
              ? sg.snittScore.toFixed(1).replace(".", ",")
              : "—"
          }
          sub={
            sisteRundeScore != null ? `Siste runde: ${sisteRundeScore}` : "—"
          }
          tone="neutral"
          icon={Trophy}
        />
        <Kpi
          label="Streak"
          value={`${streakAktiv} d`}
          sub={`${streak14.filter(Boolean).length} av 14 dager aktiv`}
          tone={streakAktiv >= 3 ? "positive" : "neutral"}
          icon={Activity}
        />
        <Kpi
          label="Mål-fremdrift"
          value={`${malFremdriftPct} %`}
          sub={`${completedSessions.length} av ${totalSessions} økter`}
          tone={malFremdriftPct >= 75 ? "positive" : "neutral"}
          icon={Target}
        />
      </section>

      {/* TABS */}
      <nav className="flex flex-wrap gap-0.5 rounded-lg border border-border bg-secondary p-1">
        {TABS.map(({ key, label, icon: Icon }) => {
          const aktiv = tab === key;
          return (
            <Link
              key={key}
              href={`${baseHref}?tab=${key}`}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-medium transition-colors ${
                aktiv
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} strokeWidth={1.75} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* TAB-INNHOLD + QUICK ACTIONS-SIDEPANEL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {tab === "oversikt" && (
            <OversiktTab
              dager30={dager30}
              aktivPlan={
                aktivPlan
                  ? {
                      id: aktivPlan.id,
                      name: aktivPlan.name,
                      total: aktivPlan.sessions.length,
                      done: aktivPlan.sessions.filter(
                        (s) => s.status === "COMPLETED",
                      ).length,
                      startDate: aktivPlan.startDate,
                      endDate: aktivPlan.endDate,
                    }
                  : null
              }
              nesteTurnering={
                turneringsNavn != null
                  ? {
                      name: turneringsNavn,
                      dato: turneringsDato,
                      dagerTil: dagerTilTurnering,
                    }
                  : null
              }
              pyrMin={pyrMin}
              pyrTotal={pyrTotal}
              coachNotater={coachNotater.map((n) => ({
                id: n.id,
                title: n.title,
                feedback: n.log!.coachFeedback as string,
                feedbackAt: n.log!.coachFeedbackAt as Date,
                pyramidArea: n.pyramidArea,
              }))}
            />
          )}

          {tab === "treningsplan" && (
            <TreningsplanTab
              planer={player.trainingPlans.map((p) => ({
                id: p.id,
                name: p.name,
                isActive: p.isActive,
                status: p.status,
                startDate: p.startDate,
                endDate: p.endDate,
                done: p.sessions.filter((s) => s.status === "COMPLETED").length,
                total: p.sessions.length,
              }))}
              kommende={plannedSessions
                .filter((s) => s.scheduledAt >= naa)
                .sort(
                  (a, b) =>
                    a.scheduledAt.getTime() - b.scheduledAt.getTime(),
                )
                .slice(0, 6)}
            />
          )}

          {tab === "statistikk" && (
            <StatistikkTab
              rounds={player.rounds}
              sg={sg}
              dager30={dager30}
            />
          )}

          {tab === "mal" && <MalTab goals={player.goals} />}

          {tab === "notater" && (
            <NotaterTab
              notater={completedSessions
                .filter(
                  (s) =>
                    s.log?.coachFeedback != null &&
                    s.log.coachFeedback.trim().length > 0 &&
                    s.log.coachFeedbackAt != null,
                )
                .sort(
                  (a, b) =>
                    (b.log!.coachFeedbackAt as Date).getTime() -
                    (a.log!.coachFeedbackAt as Date).getTime(),
                )
                .map((s) => ({
                  id: s.id,
                  title: s.title,
                  feedback: s.log!.coachFeedback as string,
                  feedbackAt: s.log!.coachFeedbackAt as Date,
                  pyramidArea: s.pyramidArea,
                }))}
            />
          )}

          {tab === "innboks" && <InnboksTab playerId={player.id} />}
        </div>

        {/* QUICK ACTIONS */}
        <aside
          aria-label="Hurtighandlinger"
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-6 lg:self-start"
        >
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Hurtighandlinger
          </div>
          <QuickAction
            href={`/admin/innboks?tab=meldinger&to=${player.id}`}
            icon={MessageSquare}
            label="Send melding"
          />
          <QuickAction
            href={`/admin/plans/new?player=${player.id}`}
            icon={ClipboardList}
            label="Lag plan"
          />
          <QuickAction
            href={`/admin/oppfolging?player=${player.id}&type=feedback`}
            icon={CheckCircle2}
            label="Be om feedback"
          />
          <QuickAction
            href={`/admin/spillere/${player.id}?tab=notater#nytt`}
            icon={PenSquare}
            label="Logg coach-notat"
          />
          <ProfilRedigerTrigger
            variant="ghost"
            label="Rediger spiller-profil"
            title={`Rediger profil — ${player.name}`}
            targetUserId={player.id}
            className="justify-center"
            initial={{
              name: player.name,
              email: player.email,
              phone: player.phone ?? "",
              hcp: player.hcp ?? null,
              playingYears: player.playingYears ?? null,
              homeClub: player.homeClub ?? "",
              ambition: player.ambition ?? "",
              fodselsdato: "",
              adresse: "",
              kjonn: "Vil ikke oppgi",
              dominantHand: "Høyrehendt",
            }}
          />
          <div className="mt-1">
            <TrackmanImportModal
              variant="secondary"
              label="Importer TrackMan-økt"
              className="w-full"
              onBehalfOfUserId={player.id}
            />
          </div>
          <Link
            href={`/admin/elever/${player.id}`}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Åpne full 360-profil
          </Link>
        </aside>
      </div>
    </div>
  );
}

// ---------------- Sub-komponenter ----------------

function PlayerAvatar({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string;
  size: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-display font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: avatarBg(name),
        fontSize: size * 0.32,
      }}
    >
      {initialsFromName(name)}
    </div>
  );
}

function daysSinceLogin(d: Date | null): number {
  if (!d) return 999;
  return Math.floor((new Date().getTime() - d.getTime()) / 86400000);
}

function StatusBadge({ daysSinceLogin }: { daysSinceLogin: number }) {
  if (daysSinceLogin > 30) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        Inaktiv
      </span>
    );
  }
  if (daysSinceLogin > 7) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Forsinket
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      Aktiv
    </span>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "positive" | "neutral";
  icon: typeof Target;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <Icon
          size={14}
          strokeWidth={1.75}
          className="shrink-0 text-muted-foreground"
        />
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${
          tone === "positive" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Target;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary"
    >
      <Icon size={14} strokeWidth={1.75} className="shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ---------------- Tab: OVERSIKT ----------------

function OversiktTab({
  dager30,
  aktivPlan,
  nesteTurnering,
  pyrMin,
  pyrTotal,
  coachNotater,
}: {
  dager30: { dato: Date; antall: number; pyramide: string | null }[];
  aktivPlan: {
    id: string;
    name: string;
    total: number;
    done: number;
    startDate: Date;
    endDate: Date | null;
  } | null;
  nesteTurnering: {
    name: string;
    dato: Date | null;
    dagerTil: number | null;
  } | null;
  pyrMin: Record<string, number>;
  pyrTotal: number;
  coachNotater: {
    id: string;
    title: string;
    feedback: string;
    feedbackAt: Date;
    pyramidArea: string;
  }[];
}) {
  const pyrOmrader = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

  return (
    <div className="space-y-6">
      {/* Sesjon-historie siste 30 dager */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Siste 30 dager
            </div>
            <h2 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Aktivitets-kalender
            </h2>
          </div>
          <CalendarDays
            size={18}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {dager30.map((d) => {
            const intensity =
              d.antall === 0
                ? "bg-secondary border border-border"
                : d.antall === 1
                  ? "bg-primary/30"
                  : d.antall === 2
                    ? "bg-primary/60"
                    : "bg-primary";
            return (
              <div
                key={d.dato.toISOString()}
                title={`${NB_LONG.format(d.dato)} · ${d.antall} økter`}
                className={`h-7 w-7 rounded-[4px] ${intensity}`}
              />
            );
          })}
        </div>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {dager30.reduce((a, b) => a + b.antall, 0)} økter totalt ·{" "}
          {dager30.filter((d) => d.antall > 0).length} aktive dager
        </div>
      </section>

      {/* Aktiv plan + Neste turnering side ved side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="flex flex-col rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Aktiv treningsplan
            </div>
            <ClipboardList
              size={14}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>
          {aktivPlan ? (
            <>
              <Link
                href={`/admin/plans/${aktivPlan.id}`}
                className="font-display text-[16px] font-semibold leading-snug text-foreground hover:text-primary"
              >
                {aktivPlan.name}
              </Link>
              <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                {NB_DATE.format(aktivPlan.startDate)}
                {aktivPlan.endDate
                  ? ` – ${NB_DATE.format(aktivPlan.endDate)}`
                  : " · åpen"}
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>
                    {aktivPlan.done}/{aktivPlan.total} økter
                  </span>
                  <span>
                    {aktivPlan.total > 0
                      ? Math.round((aktivPlan.done / aktivPlan.total) * 100)
                      : 0}{" "}
                    %
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${aktivPlan.total > 0 ? Math.round((aktivPlan.done / aktivPlan.total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
              Ingen aktiv plan.
            </div>
          )}
        </section>

        <section className="flex flex-col rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Neste turnering
            </div>
            <Trophy
              size={14}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>
          {nesteTurnering ? (
            <>
              <div className="font-display text-[16px] font-semibold leading-snug text-foreground">
                {nesteTurnering.name}
              </div>
              {nesteTurnering.dato && (
                <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  {NB_LONG.format(nesteTurnering.dato)}
                </div>
              )}
              {nesteTurnering.dagerTil != null && (
                <div className="mt-auto pt-4">
                  <div className="font-mono text-[32px] font-semibold leading-none tabular-nums text-primary">
                    {nesteTurnering.dagerTil}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    dager til start
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
              Ingen planlagte turneringer.
            </div>
          )}
        </section>
      </div>

      {/* Pyramide-balanse (5 ringer som horisontal bar) */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pyramide-balanse · siste 12 uker
            </div>
            <h2 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Fordeling av treningstid
            </h2>
          </div>
          <Layers
            size={18}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </div>
        {pyrTotal === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
            Ingen loggførte økter siste 12 uker.
          </div>
        ) : (
          <ul className="space-y-3">
            {pyrOmrader.map((omr) => {
              const min = pyrMin[omr] ?? 0;
              const pct = pyrTotal > 0 ? (min / pyrTotal) * 100 : 0;
              return (
                <li key={omr} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground">
                    {omr}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `var(--color-pyr-${omr.toLowerCase()}, hsl(var(--primary)))`,
                      }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                    {(min / 60).toFixed(1).replace(".", ",")} t ·{" "}
                    {Math.round(pct)} %
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Coach-notater (3 siste) */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Coach-notater
            </div>
            <h2 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Siste tilbakemeldinger
            </h2>
          </div>
          <Link
            href="?tab=notater"
            className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
          >
            Se alle →
          </Link>
        </div>
        {coachNotater.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
            Ingen coach-tilbakemeldinger registrert ennå.
          </div>
        ) : (
          <ul className="space-y-3">
            {coachNotater.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-border bg-secondary/40 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold text-[13px] text-foreground">
                    {n.title}
                  </span>
                  <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {NB_DATE.format(n.feedbackAt)}
                  </time>
                </div>
                <p className="mt-2 text-[13px] leading-[1.5] text-foreground/85">
                  {n.feedback}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------- Tab: TRENINGSPLAN ----------------

function TreningsplanTab({
  planer,
  kommende,
}: {
  planer: {
    id: string;
    name: string;
    isActive: boolean;
    status: string;
    startDate: Date;
    endDate: Date | null;
    done: number;
    total: number;
  }[];
  kommende: {
    id: string;
    title: string;
    scheduledAt: Date;
    pyramidArea: string;
    durationMin: number;
    planName: string;
  }[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Planer · {planer.length}
        </h2>
        {planer.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
            Ingen planer registrert.
          </div>
        ) : (
          <ul className="space-y-3">
            {planer.map((p) => {
              const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-border bg-secondary/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/plans/${p.id}`}
                        className="block truncate font-display text-[14px] font-semibold text-foreground hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {NB_DATE.format(p.startDate)}
                        {p.endDate ? ` – ${NB_DATE.format(p.endDate)}` : " · åpen"}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
                        p.isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {p.isActive ? "Aktiv" : p.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>
                        {p.done}/{p.total} økter
                      </span>
                      <span>{pct} %</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Kommende økter · {kommende.length}
        </h2>
        {kommende.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
            Ingen kommende økter planlagt.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {kommende.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-4 py-3"
              >
                <div className="font-mono text-[12px] font-semibold leading-tight tabular-nums">
                  {NB_DATE.format(s.scheduledAt)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-[13px] text-foreground">
                    {s.title}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {s.pyramidArea} · {s.planName}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {s.durationMin} min
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------- Tab: STATISTIKK ----------------

function StatistikkTab({
  rounds,
  sg,
  dager30,
}: {
  rounds: {
    id: string;
    playedAt: Date;
    score: number;
    sgTotal: number | null;
    sgOtt: number | null;
    sgApp: number | null;
    sgArg: number | null;
    sgPutt: number | null;
    course: { name: string };
  }[];
  sg: ReturnType<typeof aggregateSg>;
  dager30: { dato: Date; antall: number; pyramide: string | null }[];
}) {
  const okter30 = dager30.reduce((a, b) => a + b.antall, 0);
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBoks label="OTT" value={sg.ott != null ? formatSg(sg.ott) : "—"} />
        <StatBoks label="APP" value={sg.app != null ? formatSg(sg.app) : "—"} />
        <StatBoks label="ARG" value={sg.arg != null ? formatSg(sg.arg) : "—"} />
        <StatBoks
          label="PUTT"
          value={sg.putt != null ? formatSg(sg.putt) : "—"}
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Aktivitet · siste 30 dager
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            {okter30} økter
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {dager30.map((d) => {
            const intensity =
              d.antall === 0
                ? "bg-secondary border border-border"
                : d.antall === 1
                  ? "bg-primary/30"
                  : d.antall === 2
                    ? "bg-primary/60"
                    : "bg-primary";
            return (
              <div
                key={d.dato.toISOString()}
                title={`${NB_LONG.format(d.dato)} · ${d.antall} økter`}
                className={`h-6 w-6 rounded-[3px] ${intensity}`}
              />
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-secondary/50 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Runder · {rounds.length} totalt
        </div>
        {rounds.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-muted-foreground">
            Ingen runder registrert.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rounds.slice(0, 10).map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-[80px_1fr_auto] items-center gap-4 px-6 py-3"
              >
                <div className="font-mono text-[11px] font-semibold tabular-nums">
                  {NB_DATE.format(r.playedAt)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">
                    {r.course.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {r.sgOtt != null && <span>OTT {formatSg(r.sgOtt)}</span>}
                    {r.sgApp != null && <span>APP {formatSg(r.sgApp)}</span>}
                    {r.sgArg != null && <span>ARG {formatSg(r.sgArg)}</span>}
                    {r.sgPutt != null && (
                      <span>PUTT {formatSg(r.sgPutt)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[16px] font-semibold tabular-nums">
                    {r.score}
                  </div>
                  {r.sgTotal != null && (
                    <div className="font-mono text-[10px] text-muted-foreground">
                      SG {formatSg(r.sgTotal)}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatBoks({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[22px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

// ---------------- Tab: MÅL ----------------

function MalTab({
  goals,
}: {
  goals: {
    id: string;
    type: string;
    title: string;
    targetValue: number | null;
    targetDate: Date | null;
    category: string;
    status: string;
  }[];
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Aktive mål · {goals.length}
        </h2>
        <Flag size={14} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      {goals.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
          Ingen aktive mål satt for denne spilleren.
        </div>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => (
            <li
              key={g.id}
              className="rounded-lg border border-border bg-secondary/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-display text-[14px] font-semibold text-foreground">
                    {g.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    <span>{g.type}</span>
                    <span>·</span>
                    <span>{g.category}</span>
                    {g.targetDate && (
                      <>
                        <span>·</span>
                        <span>frist {NB_DATE.format(g.targetDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                {g.targetValue != null && (
                  <div className="text-right">
                    <div className="font-mono text-[16px] font-semibold tabular-nums">
                      {g.targetValue}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                      mål
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------- Tab: NOTATER ----------------

function NotaterTab({
  notater,
}: {
  notater: {
    id: string;
    title: string;
    feedback: string;
    feedbackAt: Date;
    pyramidArea: string;
  }[];
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Coach-notater · {notater.length}
        </h2>
        <NotebookPen
          size={14}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />
      </div>
      {notater.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
          Ingen notater registrert ennå. Bruk &laquo;Logg coach-notat&raquo;
          for å legge til.
        </div>
      ) : (
        <ul className="space-y-3">
          {notater.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-border bg-secondary/40 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{
                      background: `var(--color-pyr-${n.pyramidArea.toLowerCase()}, hsl(var(--primary)))`,
                    }}
                  />
                  <span className="truncate font-semibold text-[13px] text-foreground">
                    {n.title}
                  </span>
                </div>
                <time className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {NB_DATE.format(n.feedbackAt)}
                </time>
              </div>
              <p className="mt-2 text-[13px] leading-[1.5] text-foreground/85">
                {n.feedback}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------- Tab: INNBOKS ----------------

function InnboksTab({ playerId }: { playerId: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Innboks
        </h2>
        <Inbox size={14} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
        <p>Meldingsutveksling med denne spilleren samles her.</p>
        <Link
          href={`/admin/innboks?tab=meldinger&to=${playerId}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MessageSquare size={14} strokeWidth={1.75} />
          Åpne meldingstråd
        </Link>
      </div>
    </section>
  );
}
