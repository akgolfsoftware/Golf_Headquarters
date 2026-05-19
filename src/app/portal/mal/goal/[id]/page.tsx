/**
 * PlayerHQ · Mål-detalj
 *
 * Rik detalj-side for ett mål (resultatmål eller prosessmål).
 * - Hero med eyebrow + tittel + countdown
 * - Stor mål-tracker (ring-progress for resultatmål, line chart for prosessmål)
 * - Tidsserie over relaterte runder/økter
 * - Coach-melding hvis finnes
 * - Actions: endre, marker oppnådd, avbryt
 *
 * Param-segmentet heter `[id]`. URL-pathen er `/portal/mal/goal/<id>` —
 * det workbench navigerer til.
 */

import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, AlertTriangle, CalendarClock, MessageSquare } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { GoalDetailClient } from "./goal-client";

type GoalKind = "RESULT" | "PROCESS";

type DummyGoal = {
  id: string;
  title: string;
  kind: GoalKind;
  typeLabel: string;
  deadline: Date | null;
  status: "ACTIVE" | "ACHIEVED" | "ABANDONED";
  probability: number; // 0–100
  mainObstacle: string;
  coachMessage: string | null;
  currentValue: number;
  targetValue: number;
  unit: string;
  history: Array<{ date: string; value: number; label: string }>;
  streak: number;
  trend: "UP" | "FLAT" | "DOWN";
};

const DUMMY: DummyGoal = {
  id: "dummy",
  title: "Top 10 NM Slag",
  kind: "RESULT",
  typeLabel: "Resultatmål",
  deadline: new Date("2026-07-08T00:00:00"),
  status: "ACTIVE",
  probability: 38,
  mainObstacle: "Du må forbedre approach-spillet med +0,4 SG",
  coachMessage:
    "Markus — fokuser på 100–150m approach denne uken. Vi henter inn 0,2 SG hvis du holder lav trajectory og lander innenfor ±3m.",
  currentValue: 14,
  targetValue: 10,
  unit: "plassering",
  history: [
    { date: "2026-04-12", value: 22, label: "Indre Østfold Open" },
    { date: "2026-04-19", value: 18, label: "Bossum-treff" },
    { date: "2026-04-27", value: 16, label: "Klubbmesterskap" },
    { date: "2026-05-04", value: 15, label: "Vårserie #2" },
    { date: "2026-05-11", value: 14, label: "Vårserie #3" },
  ],
  streak: 5,
  trend: "UP",
};

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  // Prøv å hente fra Prisma; fall tilbake til dummy hvis ikke funnet.
  let data: DummyGoal = DUMMY;
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
        // Map Prisma-data inn i view-modellen. Vi har ikke full feltdekning
        // ennå, så vi fyller manglende felt fra DUMMY for konsistent UI.
        const isResult =
          goal.type === "HCP_TARGET" || goal.type === "ROUNDS_PER_MONTH";
        data = {
          ...DUMMY,
          id: goal.id,
          title: goal.title,
          kind: isResult ? "RESULT" : "PROCESS",
          typeLabel: isResult ? "Resultatmål" : "Prosessmål",
          deadline: goal.targetDate,
          status: (goal.status as DummyGoal["status"]) ?? "ACTIVE",
          targetValue: goal.targetValue ?? DUMMY.targetValue,
          currentValue:
            goal.type === "HCP_TARGET" && user.hcp != null
              ? user.hcp
              : DUMMY.currentValue,
        };
      }
    }
  } catch {
    // Hvis Prisma-kall feiler (f.eks. ingen DB lokalt), fortsett med dummy.
  }

  const daysLeft = daysUntil(data.deadline);
  const deltaToTarget = data.currentValue - data.targetValue;
  const progressPct =
    data.kind === "RESULT"
      ? Math.max(
          0,
          Math.min(
            100,
            ((DUMMY.history[0].value - data.currentValue) /
              Math.max(1, DUMMY.history[0].value - data.targetValue)) *
              100,
          ),
        )
      : Math.min(100, (data.streak / 7) * 100);

  return (
    <div className="space-y-10">
      <Link
        href="/portal/mal"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Tilbake til mål-oversikten
      </Link>

      <PageHeader
        eyebrow={`MITT MÅL · ${data.typeLabel.toUpperCase()}`}
        titleLead="Mål:"
        titleItalic={data.title}
        sub={
          daysLeft != null
            ? `${daysLeft} dager til frist · ${data.deadline ? formatDate(data.deadline) : ""}`
            : "Uten frist"
        }
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
            <CalendarClock className="h-3 w-3" strokeWidth={1.75} />
            {data.status === "ACTIVE" ? "Aktivt" : data.status === "ACHIEVED" ? "Oppnådd" : "Avbrutt"}
          </span>
        }
      />

      <section
        aria-labelledby="tracker-heading"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Hovedtracker */}
        <div className="rounded-2xl border border-border bg-card p-8 lg:col-span-2">
          <h2
            id="tracker-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            {data.kind === "RESULT" ? "Resultat-tracker" : "Prosess-tracker"}
          </h2>

          {data.kind === "RESULT" ? (
            <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-12">
              {/* Ring-progress */}
              <RingProgress percent={data.probability} />

              <div className="flex-1 space-y-6">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Sannsynlighet for å nå målet
                  </span>
                  <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-foreground">
                    {data.probability}%
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Nåværende
                    </span>
                    <span className="font-display text-2xl font-semibold tabular-nums">
                      {data.currentValue}
                    </span>
                    <span className="text-sm text-muted-foreground">{data.unit}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Mål
                    </span>
                    <span className="font-display text-2xl font-semibold tabular-nums text-primary">
                      {data.targetValue}
                    </span>
                    <span className="text-sm text-muted-foreground">{data.unit}</span>
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
                    {Math.round(progressPct)}% gjennomført · {deltaToTarget > 0 ? `${deltaToTarget} igjen` : "i mål"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ProcessTracker
              streak={data.streak}
              history={data.history}
              trend={data.trend}
            />
          )}
        </div>

        {/* Hovedhinder / coach-tips */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 text-destructive"
                strokeWidth={1.75}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Hovedhinder
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {data.mainObstacle}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Trend siste 30 dager
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <TrendingUp
                className={`h-5 w-5 ${data.trend === "UP" ? "text-primary" : data.trend === "DOWN" ? "text-destructive" : "text-muted-foreground"}`}
                strokeWidth={1.75}
              />
              <span className="font-display text-2xl font-semibold tabular-nums">
                {data.trend === "UP" ? "Forbedring" : data.trend === "DOWN" ? "Tilbakegang" : "Stabilt"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tidsserie */}
      <section aria-labelledby="history-heading" className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-baseline justify-between">
          <h2
            id="history-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Relaterte runder og økter
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Siste 30 dager · {data.history.length} hendelser
          </span>
        </div>

        <ul className="mt-6 divide-y divide-border">
          {data.history.map((row) => (
            <li
              key={row.date}
              className="flex items-center justify-between py-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {row.label}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {new Date(row.date).toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-xl font-semibold tabular-nums">
                  #{row.value}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Coach-melding */}
      {data.coachMessage && (
        <section
          aria-labelledby="coach-heading"
          className="rounded-2xl border border-primary/30 bg-primary/5 p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <h2
                id="coach-heading"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary"
              >
                Melding fra coach
              </h2>
              <p className="mt-2 text-base leading-relaxed text-foreground">
                {data.coachMessage}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Anders Kristiansen · AK Golf Academy
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Actions */}
      {data.status === "ACTIVE" && isOwnGoal && (
        <GoalDetailClient goalId={data.id} />
      )}
    </div>
  );
}

/* --- Sub-komponenter --- */

function RingProgress({ percent }: { percent: number }) {
  const size = 160;
  const stroke = 14;
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
        fontSize="32"
      >
        {percent}%
      </text>
    </svg>
  );
}

function ProcessTracker({
  streak,
  history,
  trend,
}: {
  streak: number;
  history: DummyGoal["history"];
  trend: DummyGoal["trend"];
}) {
  const values = history.map((h) => h.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const width = 480;
  const height = 140;
  const padX = 24;
  const padY = 16;
  const stepX = (width - padX * 2) / Math.max(1, values.length - 1);

  const points = values
    .map((v, i) => {
      const x = padX + i * stepX;
      const y = padY + ((max - v) / range) * (height - padY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-baseline gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Streak
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
            className={`mt-1 font-display text-2xl font-semibold ${trend === "UP" ? "text-primary" : trend === "DOWN" ? "text-destructive" : "text-foreground"}`}
          >
            {trend === "UP" ? "Forbedring" : trend === "DOWN" ? "Tilbake" : "Stabilt"}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full"
        role="img"
        aria-label="Utvikling siste 30 dager"
      >
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {values.map((v, i) => {
          const x = padX + i * stepX;
          const y = padY + ((max - v) / range) * (height - padY * 2);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="hsl(var(--primary))"
            />
          );
        })}
      </svg>
    </div>
  );
}
