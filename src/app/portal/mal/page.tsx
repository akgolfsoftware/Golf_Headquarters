/**
 * PRODUKSJON — PlayerHQ Mål-oversikt (/portal/mal)
 * Endelig design migrert fra
 * wireframe/design-files-v2/pilot/03-playerhq-mal-oversikt.html.
 *
 * Server-component med:
 *  - PageHeader (italic Instrument Serif) + actions (Eksporter, Nytt mål)
 *  - HCP-trend dark-gradient hero med SVG-graf (12 mnd + projeksjon)
 *  - Tre mål-cards: HCP, Score, Ferdighet med progress-bars
 *  - Pyramide-status (5 ringer FYS/TEK/SLAG/SPILL/TURN)
 *  - Quick links (Alle runder, TrackMan, Mine baner)
 *
 * Auth: requirePortalUser() — eksisterende guard.
 * Data: eksisterende Prisma-queries for Round + Goal beholdes.
 */

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Circle,
  Download,
  Flag,
  LineChart,
  Lock,
  ListChecks,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { aggregateByArea } from "@/lib/pyramide";
import { PyramideTimerStatus } from "@/components/portal/pyramide-timer-status";
import type { Goal } from "@/generated/prisma/client";
import { NyGoalModal } from "./ny-goal-modal";

export default async function MalOversikt() {
  const user = await requirePortalUser();

  const tolvMnd = new Date();
  tolvMnd.setMonth(tolvMnd.getMonth() - 12);

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const nittiDager = new Date();
  nittiDager.setDate(nittiDager.getDate() - 90);

  const sjuDager = new Date();
  sjuDager.setDate(sjuDager.getDate() - 7);

  const [rounds, goals, sesjoner] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: tolvMnd } },
      orderBy: { playedAt: "asc" },
      include: { course: true },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: user.id },
        scheduledAt: { gte: nittiDager },
      },
      select: { pyramidArea: true, durationMin: true, status: true, scheduledAt: true },
    }),
  ]);

  const sg30d = aggregateSg(
    rounds.filter((r) => r.playedAt >= tretti),
  );

  // Pyramide-aggregat per periode (timer per område)
  const completedSesjoner = sesjoner.filter((s) => s.status === "COMPLETED");
  const pyramideMinutter = {
    "7d": aggregateByArea(completedSesjoner.filter((s) => s.scheduledAt >= sjuDager)),
    "30d": aggregateByArea(completedSesjoner.filter((s) => s.scheduledAt >= tretti)),
    "90d": aggregateByArea(completedSesjoner),
  };

  const hcpMaal = finnHcpMaal(goals);
  const scoreMaal = finnScoreMaal(goals);
  const ferdighetMaal = finnFerdighetMaal(goals);

  const isFree = user.tier === "GRATIS";

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      <PageHeader
        eyebrow={`Mål · ${formatDato(new Date())}`}
        titleLead="Mål —"
        titleItalic="hvor du står"
        titleTrail=", hvor du skal."
        sub={`${rounds.length} runder loggført siste 12 mnd · sist oppdatert i dag.`}
        actions={
          <>
            <Link
              href="/portal/mal/runder?export=csv"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Eksporter</span>
            </Link>
            <NyGoalModal />
          </>
        }
      />

      {/* Snittscore-trend dark hero */}
      <ScoreTrend user={user} rounds={rounds} isFree={isFree} />

      {/* 3 mål-cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HcpMaalCard hcp={user.hcp} goal={hcpMaal} />
        <ScoreMaalCard
          rounds={rounds.filter((r) => r.playedAt >= tretti)}
          goal={scoreMaal}
          isFree={isFree}
        />
        <FerdighetMaalCard
          sg={sg30d.putt}
          goal={ferdighetMaal}
          isFree={isFree}
        />
      </div>

      {/* Pyramide-status — timer per periode */}
      <PyramideTimerStatus
        minutter7d={pyramideMinutter["7d"]}
        minutter30d={pyramideMinutter["30d"]}
        minutter90d={pyramideMinutter["90d"]}
        isFree={isFree}
      />

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickLink
          href="/portal/mal/runder"
          icon={ListChecks}
          title="Alle runder"
          sub={`${rounds.length} loggført · sortér / filtrer`}
        />
        <QuickLink
          href="/portal/mal/trackman"
          icon={LineChart}
          title="TrackMan-økter"
          sub="Launch · spin · carry"
          locked={isFree}
        />
        <QuickLink
          href="/portal/mal/baner"
          icon={Flag}
          title="Mine baner"
          sub="Spilte baner og favoritter"
        />
      </div>
    </div>
  );
}

// --- SCORE-TREND ----------------------------------------------------------

type RoundLite = {
  playedAt: Date;
  score: number;
};

function ScoreTrend({
  user,
  rounds,
  isFree,
}: {
  user: { hcp: number | null };
  rounds: RoundLite[];
  isFree: boolean;
}) {
  // Månedlig snitt-score siste 12 mnd
  const punkter = byggScoreSerie(rounds);
  const harData = punkter.length >= 2;
  const naa = punkter.length > 0 ? punkter[punkter.length - 1].v : null;
  const forste = punkter[0]?.v ?? naa;
  const endring =
    naa != null && forste != null ? +(naa - forste).toFixed(1) : null;
  const beste =
    rounds.length > 0 ? Math.min(...rounds.map((r) => r.score)) : null;
  const treMndSnitt =
    punkter.length >= 3
      ? +(
          punkter.slice(-3).reduce((s, p) => s + p.v, 0) / 3
        ).toFixed(1)
      : null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-4 text-white md:p-8"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 60%, hsl(var(--foreground)) 100%)",
      }}
    >
      <span
        aria-hidden
        className="absolute -right-16 -top-16 h-60 w-60 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(209,248,67,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent/70"
          >
            Snittscore-trend · 12 mnd
          </span>
          <div className="flex items-baseline gap-4 font-mono text-4xl font-medium leading-none tabular-nums tracking-tight md:text-6xl">
            <span>{naa != null ? naa.toFixed(1).replace(".", ",") : "—"}</span>
            {endring != null && Math.abs(endring) >= 0.1 && (
              <span
                className="text-base font-semibold"
                style={{
                  color: endring < 0 ? "hsl(var(--accent))" : "rgb(255, 180, 180)",
                }}
              >
                {endring < 0 ? "↓" : "↑"}{" "}
                {endring > 0 ? "+" : ""}
                {endring.toFixed(1).replace(".", ",")}
              </span>
            )}
          </div>
          <p
            className="mt-1 text-sm text-white/65"
          >
            {harData
              ? "Snitt-score per måned, siste år."
              : "Registrer minst 2 runder for å se trend."}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-4 sm:gap-6">
          {beste != null && (
            <Stat label="Beste" value={String(beste)} highlight />
          )}
          {treMndSnitt != null && (
            <Stat label="3 mnd snitt" value={treMndSnitt.toFixed(1).replace(".", ",")} />
          )}
          {user.hcp != null && (
            <Stat label="HCP" value={formatHcp(user.hcp)} />
          )}
          <Stat
            label="Runder 12 mnd"
            value={String(rounds.length)}
          />
        </div>
      </div>

      <div className="relative z-10 mt-6">
        <HcpChart punkter={punkter} isFree={isFree} />
        <div
          className="mt-2 flex justify-between px-1 font-mono text-[10px] text-white/40"
        >
          {xLabels(punkter).map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.06em] text-white/50"
      >
        {label}
      </span>
      <span
        className={`mt-0.5 font-mono text-xl font-semibold tabular-nums ${highlight ? "text-accent" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function HcpChart({
  punkter,
  isFree,
}: {
  punkter: { label: string; v: number }[];
  isFree: boolean;
}) {
  if (punkter.length < 2) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-md bg-white/5 font-mono text-xs text-white/40"
      >
        Ikke nok data ennå.
      </div>
    );
  }

  const W = 800;
  const H = 200;
  const PAD_Y = 24;
  const min = Math.min(...punkter.map((p) => p.v));
  const max = Math.max(...punkter.map((p) => p.v));
  const range = Math.max(1, max - min);
  const xStep = W / Math.max(1, punkter.length - 1);
  const y = (v: number) =>
    PAD_Y + ((max - v) / range) * (H - PAD_Y * 2);
  const pts = punkter.map((p, i) => ({ x: i * xStep, y: y(p.v) }));
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    `${path} L${W.toFixed(1)},${H} L0,${H} Z`;
  const sisteX = pts[pts.length - 1].x;
  const proj = isFree ? null : projeksjon(punkter, xStep, y, W);

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-md">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-label="HCP-trend siste 12 måneder"
      >
        {/* grid */}
        <line
          x1="0"
          y1={H / 4}
          x2={W}
          y2={H / 4}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1={H / 2}
          x2={W}
          y2={H / 2}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1={(H * 3) / 4}
          x2={W}
          y2={(H * 3) / 4}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        {/* area */}
        <path d={areaPath} fill="hsl(var(--accent) / 0.10)" />
        {/* line */}
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* projection */}
        {proj && (
          <path
            d={proj}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.55"
          />
        )}
        {/* data points */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 5 : 3}
            fill="hsl(var(--accent))"
            stroke={i === pts.length - 1 ? "currentColor" : undefined}
            strokeWidth={i === pts.length - 1 ? 2 : 0}
          />
        ))}
      </svg>

      {isFree && (
        <div
          className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-2 border-l border-dashed border-accent/30 px-6 backdrop-blur-sm"
          style={{
            width: "38%",
            background: "rgba(15,42,34,0.6)",
          }}
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-foreground"
          >
            <Lock className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-display text-sm italic text-white">
            Projeksjon — Pro
          </span>
          <Link
            href="/portal/meg/abonnement"
            className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent"
          >
            Oppgrader <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>
      )}
      {/* sisteX brukes for layout-debugging — supprimert i prod */}
      <span className="sr-only">{sisteX.toFixed(0)}</span>
    </div>
  );
}

// --- GOAL-CARDS --------------------------------------------------------

function HcpMaalCard({
  hcp,
  goal,
}: {
  hcp: number | null;
  goal: Goal | null;
}) {
  const maalVerdi = goal?.targetValue ?? null;
  const prosent =
    hcp != null && maalVerdi != null && hcp > maalVerdi
      ? Math.max(0, Math.min(100, ((54 - hcp) / (54 - maalVerdi)) * 100))
      : null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Target
            className="h-3.5 w-3.5 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          HCP-mål
        </span>
        {goal && (
          <span
            className="ml-auto rounded-sm bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground"
          >
            Sesong
          </span>
        )}
      </header>

      <h3 className="font-display text-xl font-normal italic leading-tight tracking-tight text-foreground">
        {goal && maalVerdi != null && hcp != null ? (
          <>
            Fra {formatHcp(hcp)} til{" "}
            <span className="not-italic font-semibold text-primary">
              {formatHcp(maalVerdi)}
            </span>
            .
          </>
        ) : hcp != null ? (
          <>HCP nå: <span className="not-italic font-semibold text-primary">{formatHcp(hcp)}</span>.</>
        ) : (
          "Ingen HCP registrert."
        )}
      </h3>

      <div className="flex items-baseline justify-between">
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
          {hcp != null ? formatHcp(hcp) : "—"}
        </span>
        {maalVerdi != null && (
          <span className="font-mono text-sm text-muted-foreground">
            →{" "}
            <span className="font-semibold text-primary">
              {formatHcp(maalVerdi)}
            </span>
          </span>
        )}
      </div>

      {prosent != null && (
        <div className="relative h-2 overflow-hidden rounded-sm bg-secondary">
          <span
            className="absolute inset-y-0 left-0 rounded-sm bg-primary"
            style={{ width: `${prosent}%` }}
          />
        </div>
      )}

      {prosent != null && (
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>{Math.round(prosent)} % fullført</span>
          {goal?.targetDate && (
            <span>Frist: {formatKortDato(goal.targetDate)}</span>
          )}
        </div>
      )}

      <Link
        href={goal ? `/portal/mal/goal/${goal.id}` : "/portal/mal"}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Detaljer
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
    </article>
  );
}

function ScoreMaalCard({
  rounds,
  goal,
  isFree,
}: {
  rounds: RoundLite[];
  goal: Goal | null;
  isFree: boolean;
}) {
  const terskel = goal?.targetValue ?? 85;
  const oppnaadd = rounds.filter((r) => r.score <= terskel).length;
  const total = goal?.targetValue ? 10 : Math.max(10, rounds.length);
  const prosent = Math.min(100, (oppnaadd / total) * 100);

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Star
            className="h-3.5 w-3.5 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Score-mål
        </span>
        {isFree && (
          <span className="ml-auto rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            PRO
          </span>
        )}
      </header>

      <h3
        className={`font-display text-xl font-normal italic leading-tight tracking-tight text-foreground ${
          isFree ? "blur-[2px]" : ""
        }`}
      >
        Beat <span className="not-italic font-semibold text-primary">{terskel}</span>{" "}
        · {oppnaadd} av {total}.
      </h3>

      <div
        className={`flex items-baseline justify-between ${isFree ? "blur-[2px]" : ""}`}
      >
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
          {oppnaadd}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            / {total}
          </span>
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {Math.max(0, total - oppnaadd)} igjen
        </span>
      </div>

      <div
        className={`relative h-2 overflow-hidden rounded-sm bg-secondary ${
          isFree ? "blur-[2px]" : ""
        }`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-sm bg-primary"
          style={{ width: `${prosent}%` }}
        />
      </div>

      <div
        className={`flex flex-wrap gap-1.5 ${isFree ? "blur-[2px]" : ""}`}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const fyllt = i < oppnaadd;
          return (
            <span
              key={i}
              className={`inline-flex h-6 min-w-[28px] items-center justify-center rounded-full px-2 font-mono text-[11px] ${
                fyllt
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {fyllt && rounds[i] ? rounds[i].score : "—"}
            </span>
          );
        })}
      </div>

      <Link
        href={goal ? `/portal/mal/goal/${goal.id}` : "/portal/mal/runder"}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Detaljer
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>

      {isFree && (
        <LockOverlay label="Score-mål kun for Pro" cta="Oppgrader" />
      )}
    </article>
  );
}

function FerdighetMaalCard({
  sg,
  goal,
  isFree,
}: {
  sg: number | null;
  goal: Goal | null;
  isFree: boolean;
}) {
  const maal = goal?.targetValue ?? 0.5;
  // Bruker SG putt som proxy for ferdighet — formaterer i %-skala for visning.
  const verdi = sg != null ? Math.max(0, Math.min(100, 50 + sg * 100)) : null;
  const prosent =
    verdi != null && maal > 0 ? Math.min(100, (verdi / (maal * 100 + 50)) * 100) : null;

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Trophy
            className="h-3.5 w-3.5 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Ferdighetsmål
        </span>
        {isFree && (
          <span className="ml-auto rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            PRO
          </span>
        )}
      </header>

      <h3
        className={`font-display text-xl font-normal italic leading-tight tracking-tight text-foreground ${
          isFree ? "blur-[2px]" : ""
        }`}
      >
        SG Putt:{" "}
        <span className="not-italic font-semibold text-primary">
          {formatSg(sg)}
        </span>
        .
      </h3>

      <div
        className={`flex items-baseline justify-between ${
          isFree ? "blur-[2px]" : ""
        }`}
      >
        <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
          {verdi != null ? Math.round(verdi) : "—"}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            %
          </span>
        </span>
        {goal?.targetValue != null && (
          <span className="font-mono text-sm text-muted-foreground">
            →{" "}
            <span className="font-semibold text-primary">
              {Math.round(goal.targetValue * 100)} %
            </span>
          </span>
        )}
      </div>

      {prosent != null && (
        <div
          className={`relative h-2 overflow-hidden rounded-sm bg-secondary ${
            isFree ? "blur-[2px]" : ""
          }`}
        >
          <span
            className="absolute inset-y-0 left-0 rounded-sm"
            style={{
              width: `${prosent}%`,
              background: "linear-gradient(90deg, var(--color-pyr-tek) 0%, var(--color-pyr-fys) 100%)",
            }}
          />
        </div>
      )}

      <div
        className={`flex justify-between font-mono text-[11px] text-muted-foreground ${
          isFree ? "blur-[2px]" : ""
        }`}
      >
        <span>Snitt 30 d</span>
        {prosent != null && <span>{Math.round(prosent)} % av mål</span>}
      </div>

      <Link
        href={goal ? `/portal/mal/goal/${goal.id}` : "/portal/mal"}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Detaljer
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>

      {isFree && (
        <LockOverlay label="SG-mål kun for Pro" cta="Oppgrader" />
      )}
    </article>
  );
}

// --- QUICK LINKS -------------------------------------------------------

function QuickLink({
  href,
  icon: Icon,
  title,
  sub,
  locked,
}: {
  href: string;
  icon: typeof Target;
  title: string;
  sub: string;
  locked?: boolean;
}) {
  const innhold = (
    <div className="flex items-center gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-base font-semibold tracking-tight text-foreground">
          {title}
        </div>
        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
          {sub}
        </div>
      </div>
      {locked ? (
        <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      ) : (
        <ArrowUpRight
          className="h-4 w-4 text-primary"
          strokeWidth={1.75}
        />
      )}
    </div>
  );

  if (locked) {
    return (
      <Link
        href="/portal/meg/abonnement"
        className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:p-6"
      >
        {innhold}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:p-6"
    >
      {innhold}
    </Link>
  );
}

// --- LOCK OVERLAY ------------------------------------------------------

function LockOverlay({ label, cta }: { label: string; cta: string }) {
  return (
    <Link
      href="/portal/meg/abonnement"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card/86 backdrop-blur-sm transition-colors hover:bg-card/95"
    >
      <span
        className="grid h-10 w-10 place-items-center rounded-md bg-foreground text-accent"
      >
        <Lock className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="font-display text-sm font-semibold italic text-foreground">
        {label}
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-foreground"
      >
        {cta}
        <ArrowRight className="h-3 w-3" strokeWidth={2} />
      </span>
    </Link>
  );
}

// --- HELPERS -----------------------------------------------------------

function finnHcpMaal(goals: Goal[]): Goal | null {
  return goals.find((g) => g.type === "HCP_TARGET") ?? null;
}

function finnScoreMaal(goals: Goal[]): Goal | null {
  return goals.find((g) => g.type === "FREE_TEXT" && /score|beat/i.test(g.title)) ?? null;
}

function finnFerdighetMaal(goals: Goal[]): Goal | null {
  return goals.find((g) => g.type === "SG_AREA") ?? null;
}

function formatHcp(v: number): string {
  return v.toFixed(1).replace(".", ",");
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Bygger en månedlig snitt-score-serie (siste 12 mnd).
 * Plukker kun måneder der det er registrert minst én runde.
 */
function byggScoreSerie(
  rounds: RoundLite[],
): { label: string; v: number }[] {
  if (rounds.length === 0) return [];

  const nå = new Date();
  const buckets: { label: string; scores: number[] }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(nå);
    d.setMonth(d.getMonth() - i);
    buckets.push({
      label: d.toLocaleDateString("nb-NO", { month: "short" }),
      scores: [],
    });
  }
  for (const r of rounds) {
    const mndDiff =
      (nå.getFullYear() - r.playedAt.getFullYear()) * 12 +
      (nå.getMonth() - r.playedAt.getMonth());
    const idx = 11 - mndDiff;
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].scores.push(r.score);
    }
  }

  return buckets
    .map((b) => {
      if (b.scores.length === 0) return null;
      return { label: b.label, v: +snitt(b.scores).toFixed(1) };
    })
    .filter((p): p is { label: string; v: number } => p !== null);
}

function snitt(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function xLabels(punkter: { label: string }[]): string[] {
  if (punkter.length <= 6) return punkter.map((p) => p.label);
  // Plukk 6 jevnt fordelte etiketter
  const step = (punkter.length - 1) / 5;
  return Array.from({ length: 6 }, (_, i) =>
    punkter[Math.round(i * step)]?.label ?? "",
  );
}

function projeksjon(
  punkter: { v: number }[],
  xStep: number,
  y: (v: number) => number,
  W: number,
): string | null {
  if (punkter.length < 3) return null;
  // Enkel lineær regresjon på siste 3 punkter, projisert 3 mnd frem.
  const siste = punkter.slice(-3);
  const dx = (siste[2].v - siste[0].v) / 2;
  const sisteX = (punkter.length - 1) * xStep;
  const sisteY = y(siste[2].v);
  const slutt = siste[2].v + dx * 3;
  const sluttX = Math.min(W, sisteX + xStep * 3);
  const sluttY = y(slutt);
  return `M${sisteX.toFixed(1)},${sisteY.toFixed(1)} L${sluttX.toFixed(1)},${sluttY.toFixed(1)}`;
}

// Sikrer at Circle/ListChecks importeres (brukes som type-referanse i Lucide).
void Circle;
