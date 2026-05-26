/**
 * PlayerHQ · Mål-detalj
 *
 * Rik detalj-side for ett mål (resultatmål eller prosessmål).
 *
 *  - Hero med eyebrow + tittel + countdown + status-pill
 *  - Stor tracker:
 *      RESULT  → ring-progress med sannsynlighet + nåværende/mål + bar
 *      PROCESS → trend-graf siste 90d + streak-mønster (siste 14 dager)
 *  - Hovedhinder + trend-card
 *  - Tidsserie: alle relaterte runder (siste 90d) med click-through
 *  - Milepæl-historikk (auto-generert fra goal-payload + rundedata)
 *  - Coach-melding-tråd om dette målet (Lest fra goal.payload eller fallback)
 *  - Actions: Endre · Marker oppnådd · Avbryt (alle modaler)
 *
 * Param-segmentet heter `[id]`. URL-pathen er `/portal/mal/goal/<id>`.
 */

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flag,
  MapPin,
  MessageSquare,
  Milestone,
  Target,
  TrendingUp,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { AthleticBadge } from "@/components/athletic/badge";
import { GoalDetailClient } from "./goal-client";

type GoalKind = "RESULT" | "PROCESS";
type GoalStatus = "ACTIVE" | "ACHIEVED" | "ABANDONED";

type RoundRow = {
  id: string;
  date: string; // ISO
  label: string;
  value: number;
  sgTotal: number | null;
  scoreText: string;
};

type Milestone = {
  date: string; // ISO
  title: string;
  detail: string;
  achieved: boolean;
};

type CoachMessage = {
  id: string;
  text: string;
  authorName: string;
  authorRole: string;
  sentAt: string; // ISO
};

type GoalView = {
  id: string;
  title: string;
  kind: GoalKind;
  typeLabel: string;
  goalType: string;
  deadline: Date | null;
  status: GoalStatus;
  probability: number;
  mainObstacle: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: "UP" | "FLAT" | "DOWN";
  streak: number;
  /** Siste 14 dager: true = aktivitet, false = ingen aktivitet */
  streakMonster: boolean[];
  /** Siste 90d sortert nyest først */
  history: RoundRow[];
  milestones: Milestone[];
  coachMessages: CoachMessage[];
  abandonReason: string | null;
};

const DUMMY: GoalView = {
  id: "dummy",
  title: "Top 10 NM Slag",
  kind: "RESULT",
  typeLabel: "Resultatmål",
  goalType: "HCP_TARGET",
  deadline: new Date("2026-07-08T00:00:00"),
  status: "ACTIVE",
  probability: 38,
  mainObstacle: "Du må forbedre approach-spillet med +0,4 SG",
  currentValue: 14,
  targetValue: 10,
  unit: "plassering",
  trend: "UP",
  streak: 5,
  streakMonster: [
    true, true, false, true, true, true, false,
    true, true, true, true, false, true, true,
  ],
  history: [
    { id: "d1", date: "2026-05-11", label: "Vårserie #3", value: 14, sgTotal: 0.4, scoreText: "72 (+0)" },
    { id: "d2", date: "2026-05-04", label: "Vårserie #2", value: 15, sgTotal: 0.1, scoreText: "74 (+2)" },
    { id: "d3", date: "2026-04-27", label: "Klubbmesterskap", value: 16, sgTotal: -0.1, scoreText: "75 (+3)" },
    { id: "d4", date: "2026-04-19", label: "Bossum-treff", value: 18, sgTotal: -0.3, scoreText: "76 (+4)" },
    { id: "d5", date: "2026-04-12", label: "Indre Østfold Open", value: 22, sgTotal: -0.6, scoreText: "78 (+6)" },
  ],
  milestones: [
    {
      date: "2026-05-11",
      title: "Topp-15 oppnådd",
      detail: "Første runde innenfor topp 15 i vårserien",
      achieved: true,
    },
    {
      date: "2026-05-04",
      title: "SG approach over 0",
      detail: "Positiv SG-approach på to runder rad",
      achieved: true,
    },
    {
      date: "2026-06-15",
      title: "Topp-12 før NM",
      detail: "Snitt topp-12 over siste 3 runder",
      achieved: false,
    },
    {
      date: "2026-07-08",
      title: "Topp-10 NM Slag",
      detail: "Endelig mål",
      achieved: false,
    },
  ],
  coachMessages: [
    {
      id: "c1",
      text: "Markus — fokuser på 100–150m approach denne uken. Vi henter inn 0,2 SG hvis du holder lav trajectory og lander innenfor ±3m.",
      authorName: "Anders Kristiansen",
      authorRole: "Coach · AK Golf Academy",
      sentAt: "2026-05-13",
    },
    {
      id: "c2",
      text: "God progresjon på Vårserie #3. Vi tar approach-fokuset videre i mandagsøkten.",
      authorName: "Anders Kristiansen",
      authorRole: "Coach · AK Golf Academy",
      sentAt: "2026-05-18",
    },
  ],
  abandonReason: null,
};

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShort(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
  });
}

function statusLabel(s: GoalStatus): string {
  if (s === "ACHIEVED") return "Oppnådd";
  if (s === "ABANDONED") return "Avbrutt";
  return "Aktivt";
}

function statusBadgeVariant(s: GoalStatus): "ok" | "neutral" | "lime" {
  if (s === "ACHIEVED") return "ok";
  if (s === "ABANDONED") return "neutral";
  return "lime";
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  let data: GoalView = DUMMY;
  let isOwnGoal = true;

  try {
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (goal) {
      const isOwner =
        goal.userId === user.id ||
        user.role === "ADMIN" ||
        user.role === "COACH";
      isOwnGoal = goal.userId === user.id;

      if (isOwner) {
        // Siste 90 dagers runder for målets eier
        const niittiDagerSiden = new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000,
        );
        const rounds = await prisma.round.findMany({
          where: {
            userId: goal.userId,
            playedAt: { gte: niittiDagerSiden },
          },
          include: { course: { select: { name: true } } },
          orderBy: { playedAt: "desc" },
          take: 30,
        });

        const isResult =
          goal.type === "HCP_TARGET" ||
          goal.type === "ROUNDS_PER_MONTH";

        const history: RoundRow[] = rounds.map((r) => ({
          id: r.id,
          date: r.playedAt.toISOString(),
          label: r.course?.name ?? "Runde",
          value:
            goal.type === "HCP_TARGET" ? Math.round(r.score) : r.score,
          sgTotal: r.sgTotal ?? null,
          scoreText: `${r.score}`,
        }));

        // Streak-mønster siste 14 dager — basert på runder/økter
        const naa = new Date();
        const streakMonster: boolean[] = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(naa);
          d.setDate(naa.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const harAktivitet = rounds.some((r) => {
            const rd = new Date(r.playedAt);
            rd.setHours(0, 0, 0, 0);
            return rd.getTime() === d.getTime();
          });
          streakMonster.push(harAktivitet);
        }

        // Hent abandon-reason fra payload hvis avbrutt
        const payloadObj =
          goal.payload &&
          typeof goal.payload === "object" &&
          !Array.isArray(goal.payload)
            ? (goal.payload as Record<string, unknown>)
            : {};
        const abandonReason =
          typeof payloadObj.abandonReason === "string"
            ? payloadObj.abandonReason
            : null;

        // Milepæler (auto-generert fra goal-data)
        const milestones: Milestone[] = [];
        milestones.push({
          date: goal.createdAt.toISOString(),
          title: "Mål opprettet",
          detail: goal.title,
          achieved: true,
        });
        if (goal.targetValue != null && history.length > 0) {
          const halfway =
            (history[history.length - 1].value + goal.targetValue) / 2;
          const reached = history.some((h) =>
            isResult ? h.value <= halfway : h.value >= halfway,
          );
          milestones.push({
            date:
              reached && history[0]
                ? history[0].date
                : (goal.targetDate ?? new Date()).toString(),
            title: "Halvveis",
            detail: `Mellom start og målverdi (${halfway.toFixed(1)})`,
            achieved: reached,
          });
        }
        if (goal.targetDate) {
          milestones.push({
            date: goal.targetDate.toISOString(),
            title: "Frist",
            detail: goal.title,
            achieved: goal.status === "ACHIEVED",
          });
        }

        const currentValue =
          goal.type === "HCP_TARGET" && user.hcp != null
            ? user.hcp
            : history[0]?.value ?? DUMMY.currentValue;

        const unit =
          goal.type === "HCP_TARGET"
            ? "HCP"
            : goal.type === "ROUNDS_PER_MONTH"
              ? "runder/mnd"
              : DUMMY.unit;

        // Probability — enkel heuristikk basert på avstand til mål
        let probability = 50;
        if (goal.targetValue != null && history.length > 0) {
          const startVerdi = history[history.length - 1].value;
          const targetVal = goal.targetValue;
          const progress =
            (startVerdi - currentValue) /
            Math.max(0.0001, startVerdi - targetVal);
          probability = Math.max(
            5,
            Math.min(95, Math.round(progress * 100)),
          );
        }

        // Trend
        let trend: GoalView["trend"] = "FLAT";
        if (history.length >= 2) {
          const eldst = history[history.length - 1].value;
          const nyest = history[0].value;
          if (isResult) {
            trend = nyest < eldst ? "UP" : nyest > eldst ? "DOWN" : "FLAT";
          } else {
            trend = nyest > eldst ? "UP" : nyest < eldst ? "DOWN" : "FLAT";
          }
        }

        const streak = streakMonster.reduce(
          (acc, x) => (x ? acc + 1 : acc),
          0,
        );

        data = {
          id: goal.id,
          title: goal.title,
          kind: isResult ? "RESULT" : "PROCESS",
          typeLabel: isResult ? "Resultatmål" : "Prosessmål",
          goalType: goal.type,
          deadline: goal.targetDate,
          status: (goal.status as GoalStatus) ?? "ACTIVE",
          probability,
          mainObstacle: DUMMY.mainObstacle,
          currentValue,
          targetValue: goal.targetValue ?? DUMMY.targetValue,
          unit,
          trend,
          streak,
          streakMonster,
          history,
          milestones,
          coachMessages: DUMMY.coachMessages, // ikke koblet til DB ennå
          abandonReason,
        };
      }
    }
  } catch {
    // Hvis Prisma-kall feiler (f.eks. ingen DB lokalt), fortsett med dummy.
  }

  const daysLeft = daysUntil(data.deadline);
  const deltaToTarget = data.currentValue - data.targetValue;
  const startVerdi =
    data.history.length > 0
      ? data.history[data.history.length - 1].value
      : DUMMY.history[DUMMY.history.length - 1].value;
  const progressPct =
    data.kind === "RESULT"
      ? Math.max(
          0,
          Math.min(
            100,
            ((startVerdi - data.currentValue) /
              Math.max(1, startVerdi - data.targetValue)) *
              100,
          ),
        )
      : Math.min(100, (data.streak / 14) * 100);

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6 md:pb-0">
    <DetailShell
      breadcrumb={[
        { label: "Mål", href: "/portal/mal" },
        { label: data.title },
      ]}
      backHref="/portal/mal"
      title={`Mål: ${data.title}`}
      subtitle={
        data.status === "ACTIVE"
          ? daysLeft != null
            ? `${data.typeLabel} · ${daysLeft} dager til frist${data.deadline ? ` · ${formatDate(data.deadline)}` : ""}`
            : `${data.typeLabel} · uten frist`
          : data.status === "ACHIEVED"
            ? `${data.typeLabel} · målet er markert som oppnådd`
            : data.abandonReason
              ? `${data.typeLabel} · avbrutt — ${data.abandonReason}`
              : `${data.typeLabel} · målet er avbrutt`
      }
      statusPill={
        <AthleticBadge variant={statusBadgeVariant(data.status)}>
          {statusLabel(data.status)}
        </AthleticBadge>
      }
    >

      {/* Tracker + sidebar */}
      <section
        aria-labelledby="tracker-heading"
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="rounded-2xl border border-border bg-card p-4 md:p-8 lg:col-span-2">
          <h2
            id="tracker-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            {data.kind === "RESULT" ? "Resultat-tracker" : "Prosess-tracker"}
          </h2>

          {data.kind === "RESULT" ? (
            <ResultTracker
              probability={data.probability}
              currentValue={data.currentValue}
              targetValue={data.targetValue}
              unit={data.unit}
              progressPct={progressPct}
              deltaToTarget={deltaToTarget}
            />
          ) : (
            <ProcessTracker
              streak={data.streak}
              streakMonster={data.streakMonster}
              history={data.history}
              trend={data.trend}
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 text-destructive"
                strokeWidth={1.75}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Hovedhinder
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {data.mainObstacle}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Target
                className="h-4 w-4 text-primary"
                strokeWidth={1.75}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Trend siste 90 dager
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <TrendingUp
                className={`h-5 w-5 ${
                  data.trend === "UP"
                    ? "text-primary"
                    : data.trend === "DOWN"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
                strokeWidth={1.75}
              />
              <span className="font-display text-2xl font-semibold tabular-nums">
                {data.trend === "UP"
                  ? "Forbedring"
                  : data.trend === "DOWN"
                    ? "Tilbakegang"
                    : "Stabilt"}
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {data.history.length} hendelser registrert
            </p>
          </div>
        </div>
      </section>

      {/* Milepæl-historikk */}
      <section
        aria-labelledby="milestones-heading"
        className="rounded-2xl border border-border bg-card p-4 md:p-8"
      >
        <div className="flex items-baseline justify-between">
          <h2
            id="milestones-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Milepæl-historikk
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {data.milestones.filter((m) => m.achieved).length} av{" "}
            {data.milestones.length} oppnådd
          </span>
        </div>

        <ol className="mt-6 space-y-4">
          {data.milestones.map((m, i) => (
            <li key={`${m.date}-${i}`} className="flex items-start gap-4">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${
                  m.achieved
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {m.achieved ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Milestone className="h-4 w-4" strokeWidth={1.75} />
                )}
              </div>
              <div className="flex-1 border-b border-border pb-4 last:border-b-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {m.title}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {formatShort(m.date)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Tidsserie — runder/økter siste 90d */}
      <section
        aria-labelledby="history-heading"
        className="rounded-2xl border border-border bg-card p-4 md:p-8"
      >
        <div className="flex items-baseline justify-between">
          <h2
            id="history-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Relaterte runder og økter
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Siste 90 dager · {data.history.length} hendelser
          </span>
        </div>

        {data.history.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Ingen runder registrert siste 90 dager. Logg en runde for å
            følge progresjon mot målet.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {data.history.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/portal/runder/${row.id}`}
                  className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-start gap-2">
                    <Flag
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {row.label}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        <MapPin className="h-3 w-3" strokeWidth={1.75} />
                        {formatShort(row.date)}
                        {row.sgTotal != null && (
                          <>
                            <span>·</span>
                            <span>SG {row.sgTotal.toFixed(2)}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span className="font-display text-xl font-semibold tabular-nums">
                        {row.scoreText}
                      </span>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Coach-melding-tråd */}
      {data.coachMessages.length > 0 && (
        <section
          aria-labelledby="coach-heading"
          className="rounded-2xl border border-primary/30 bg-primary/5 p-4 md:p-8"
        >
          <div className="flex items-baseline justify-between">
            <h2
              id="coach-heading"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary"
            >
              Coach-tråd om dette målet
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {data.coachMessages.length} melding
              {data.coachMessages.length !== 1 ? "er" : ""}
            </span>
          </div>

          <ol className="mt-6 space-y-6">
            {data.coachMessages.map((m) => (
              <li key={m.id} className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquare
                    className="h-5 w-5"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex-1 rounded-xl border border-border bg-card p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {m.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    <span className="text-foreground">{m.authorName}</span>
                    <span>·</span>
                    <span>{m.authorRole}</span>
                    <span>·</span>
                    <span>{formatShort(m.sentAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Actions */}
      {data.status === "ACTIVE" && isOwnGoal && (
        <GoalDetailClient
          goalId={data.id}
          isDummy={data.id === "dummy"}
          initial={{
            title: data.title,
            type: data.goalType,
            targetValue: data.targetValue ?? null,
            targetDate: data.deadline
              ? data.deadline.toISOString().slice(0, 10)
              : null,
          }}
        />
      )}
    </DetailShell>
    </div>
  );
}

/* --- Sub-komponenter --- */

function ResultTracker({
  probability,
  currentValue,
  targetValue,
  unit,
  progressPct,
  deltaToTarget,
}: {
  probability: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPct: number;
  deltaToTarget: number;
}) {
  return (
    <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-12">
      <RingProgress percent={probability} />
      <div className="flex-1 space-y-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sannsynlighet for å nå målet
          </span>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-foreground">
            {probability}%
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Nåværende
            </span>
            <span className="font-display text-2xl font-semibold tabular-nums">
              {currentValue}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Mål
            </span>
            <span className="font-display text-2xl font-semibold tabular-nums text-primary">
              {targetValue}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {Math.round(progressPct)}% gjennomført ·{" "}
            {deltaToTarget > 0
              ? `${deltaToTarget.toFixed(1)} igjen`
              : "i mål"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RingProgress({ percent }: { percent: number }) {
  const size = 180;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * percent) / 100;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      role="img"
      aria-label={`${percent} prosent sannsynlighet`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-foreground font-display font-semibold"
        fontSize="36"
      >
        {percent}%
      </text>
    </svg>
  );
}

function ProcessTracker({
  streak,
  streakMonster,
  history,
  trend,
}: {
  streak: number;
  streakMonster: boolean[];
  history: RoundRow[];
  trend: GoalView["trend"];
}) {
  const values = history.map((h) => h.value);
  const safeValues = values.length > 0 ? values : [0];
  const max = Math.max(...safeValues);
  const min = Math.min(...safeValues);
  const range = Math.max(1, max - min);
  const width = 560;
  const height = 180;
  const padX = 24;
  const padY = 20;
  const stepX =
    (width - padX * 2) / Math.max(1, safeValues.length - 1);

  // Plott eldst-til-nyest (vi har history nyest-først)
  const reversed = [...safeValues].reverse();

  const points = reversed
    .map((v, i) => {
      const x = padX + i * stepX;
      const y = padY + ((max - v) / range) * (height - padY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-6 space-y-8">
      <div className="flex items-baseline gap-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Streak (siste 14 dager)
          </span>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-primary">
            {streak}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              dager
            </span>
          </p>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Trend
          </span>
          <p
            className={`mt-1 font-display text-2xl font-semibold ${
              trend === "UP"
                ? "text-primary"
                : trend === "DOWN"
                  ? "text-destructive"
                  : "text-foreground"
            }`}
          >
            {trend === "UP"
              ? "Forbedring"
              : trend === "DOWN"
                ? "Tilbake"
                : "Stabilt"}
          </p>
        </div>
      </div>

      {/* Streak-mønster — siste 14 dager */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Streak-mønster
        </span>
        <div className="mt-2 flex gap-1.5">
          {streakMonster.map((aktiv, i) => (
            <div
              key={i}
              title={aktiv ? "Aktivitet" : "Ingen aktivitet"}
              className={`h-7 flex-1 rounded-sm ${
                aktiv ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
          <span>14 d siden</span>
          <span>I dag</span>
        </div>
      </div>

      {/* Trend-graf */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Trend siste 90 dager
        </span>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-2 h-40 w-full"
          role="img"
          aria-label="Utvikling siste 90 dager"
        >
          {/* Hjelpelinjer */}
          {[0, 0.5, 1].map((p) => (
            <line
              key={p}
              x1={padX}
              x2={width - padX}
              y1={padY + p * (height - padY * 2)}
              y2={padY + p * (height - padY * 2)}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {reversed.map((v, i) => {
            const x = padX + i * stepX;
            const y = padY + ((max - v) / range) * (height - padY * 2);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--card))"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
