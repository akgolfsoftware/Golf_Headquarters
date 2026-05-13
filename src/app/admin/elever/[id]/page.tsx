/**
 * Spiller 360-profil — endelig produksjons-design.
 * Designmal: /360-demo (hero + pyramide-donut + 4 stat-kort + heatmap + tidslinje).
 *
 * Henter aktiv spiller med planer, runder, tester og TrackMan, og rendrer
 * full 360-visning. Data som ennå ikke har egen Prisma-modell (SG-trend,
 * pyramide-fordeling, heatmap, milepæler) beregnes fra eksisterende rader
 * eller faller tilbake til null/tomme tilstand.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarPlus,
  ClipboardList,
  MessageSquare,
  Pencil,
  Trophy,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import type { PyramidArea } from "@/generated/prisma/client";

type PyrKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

const PYR_KEYS: PyrKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const PYR_META: Record<
  PyrKey,
  { color: string; name: string; sub: string }
> = {
  FYS: {
    color: "var(--color-pyr-fys)",
    name: "FYS · fysisk fundament",
    sub: "Mobilitet, styrke, rotasjon",
  },
  TEK: {
    color: "var(--color-pyr-tek)",
    name: "TEK · teknikk",
    sub: "Sving-arbeid, video",
  },
  SLAG: {
    color: "var(--color-pyr-slag)",
    name: "SLAG · slagprogresjon",
    sub: "Range, sand, putte",
  },
  SPILL: {
    color: "var(--color-pyr-spill)",
    name: "SPILL · banespill",
    sub: "9- og 18-hulls",
  },
  TURN: {
    color: "var(--color-pyr-turn)",
    name: "TURN · turnering",
    sub: "Konkurransepuls",
  },
};

const NB = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
});
const NB_FULL = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

function isoWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toFixed(1).replace(".", ",")}`;
}

function tierLabel(tier: string): string {
  if (tier === "PRO") return "PRO";
  if (tier === "ELITE") return "ELITE";
  return "GRATIS";
}

export default async function Profil360({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            select: {
              id: true,
              status: true,
              scheduledAt: true,
              title: true,
              pyramidArea: true,
              durationMin: true,
              log: {
                select: {
                  csAchieved: true,
                  rating: true,
                  notes: true,
                  startedAt: true,
                  completedAt: true,
                  coachFeedback: true,
                  coachFeedbackAt: true,
                },
              },
            },
            orderBy: { scheduledAt: "desc" },
          },
        },
      },
      rounds: {
        orderBy: { playedAt: "desc" },
        include: { course: true },
        take: 20,
      },
      testResults: {
        orderBy: { takenAt: "desc" },
        include: { test: true },
        take: 10,
      },
      trackManSessions: {
        orderBy: { recordedAt: "desc" },
        take: 10,
      },
      parentRelations: {
        include: {
          parent: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const initial = player.name.trim().charAt(0).toUpperCase() || "?";
  const sg = aggregateSg(player.rounds);

  // Alle planlagte økter samlet
  const allSessions = player.trainingPlans.flatMap((p) =>
    p.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      scheduledAt: s.scheduledAt,
      pyramidArea: s.pyramidArea,
      durationMin: s.durationMin,
      planName: p.name,
      planId: p.id,
      log: s.log,
    }))
  );

  // Siste 5 fullførte live-økter (har log = ble kjørt via LiveTapper)
  const livecompleted = allSessions
    .filter((s) => s.status === "COMPLETED" && s.log != null)
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    .slice(0, 5);

  const completedSessions = allSessions.filter((s) => s.status === "COMPLETED");
  const plannedSessions = allSessions.filter(
    (s) => s.status !== "COMPLETED" && s.status !== "CANCELLED"
  );

  // Økter siste 4 uker
  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(now.getDate() - 28);
  const sessions4w = completedSessions.filter(
    (s) => s.scheduledAt >= fourWeeksAgo
  );

  // Mål-progresjon: andel fullført av totalt antall økter i aktive planer
  const totalPlanSessions = allSessions.length;
  const progressPct =
    totalPlanSessions > 0
      ? Math.round((completedSessions.length / totalPlanSessions) * 100)
      : 0;

  // Pyramide-fordeling siste 12 uker (i minutter)
  const twelveWeeksAgo = new Date(now);
  twelveWeeksAgo.setDate(now.getDate() - 84);
  const sessions12w = completedSessions.filter(
    (s) => s.scheduledAt >= twelveWeeksAgo
  );

  const pyrMinutes: Record<PyrKey, number> = {
    FYS: 0,
    TEK: 0,
    SLAG: 0,
    SPILL: 0,
    TURN: 0,
  };
  for (const s of sessions12w) {
    const key = s.pyramidArea as PyramidArea as PyrKey;
    if (key in pyrMinutes) pyrMinutes[key] += s.durationMin;
  }
  const totalPyrMin = Object.values(pyrMinutes).reduce((a, b) => a + b, 0);
  const totalPyrHours = totalPyrMin / 60;
  const pyrPct: Record<PyrKey, number> = {
    FYS: 0,
    TEK: 0,
    SLAG: 0,
    SPILL: 0,
    TURN: 0,
  };
  if (totalPyrMin > 0) {
    for (const k of PYR_KEYS) {
      pyrPct[k] = Math.round((pyrMinutes[k] / totalPyrMin) * 100);
    }
  }

  // Donut conic-gradient stops
  const donutStops: string[] = [];
  let acc = 0;
  for (const k of PYR_KEYS) {
    const slice = (pyrPct[k] / 100) * 360;
    if (slice <= 0) continue;
    const start = acc;
    const end = acc + slice;
    donutStops.push(`${PYR_META[k].color} ${start}deg ${end}deg`);
    acc = end;
  }
  const donutGradient =
    donutStops.length > 0
      ? `conic-gradient(${donutStops.join(", ")})`
      : "conic-gradient(hsl(var(--secondary)) 0deg 360deg)";

  // Heatmap: 12 uker tilbake, 5 lag, summer min/uke
  const weeks: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    weeks.push(isoWeek(d));
  }
  const heatmap: Record<PyrKey, number[]> = {
    FYS: Array(12).fill(0),
    TEK: Array(12).fill(0),
    SLAG: Array(12).fill(0),
    SPILL: Array(12).fill(0),
    TURN: Array(12).fill(0),
  };
  for (const s of sessions12w) {
    const diffWeeks = Math.floor(
      (now.getTime() - s.scheduledAt.getTime()) / (7 * 86400000)
    );
    const colIdx = 11 - diffWeeks;
    if (colIdx < 0 || colIdx > 11) continue;
    const key = s.pyramidArea as PyramidArea as PyrKey;
    if (key in heatmap) heatmap[key][colIdx] += s.durationMin;
  }
  // Levels 0-4: 0=0min, 1=<60min, 2=<120min, 3=<180min, 4=180min+
  function toLevel(min: number): number {
    if (min <= 0) return 0;
    if (min < 60) return 1;
    if (min < 120) return 2;
    if (min < 180) return 3;
    return 4;
  }
  const heatLevels: Record<PyrKey, number[]> = {
    FYS: heatmap.FYS.map(toLevel),
    TEK: heatmap.TEK.map(toLevel),
    SLAG: heatmap.SLAG.map(toLevel),
    SPILL: heatmap.SPILL.map(toLevel),
    TURN: heatmap.TURN.map(toLevel),
  };

  // Tidslinje — siste 8 hendelser av blandet type
  type TimelineItem = {
    when: Date;
    kind: "round" | "session" | "test" | "trackman";
    label: string;
    sub: string;
  };
  const timeline: TimelineItem[] = [
    ...player.rounds.slice(0, 6).map<TimelineItem>((r) => ({
      when: r.playedAt,
      kind: "round",
      label: `Runde · ${r.course.name}`,
      sub: `Score ${r.score} · SG ${formatSg(r.sgTotal)}`,
    })),
    ...completedSessions.slice(0, 6).map<TimelineItem>((s) => ({
      when: s.scheduledAt,
      kind: "session",
      label: `Økt · ${s.title}`,
      sub: `${s.pyramidArea} · ${s.durationMin} min`,
    })),
    ...player.testResults.slice(0, 4).map<TimelineItem>((t) => ({
      when: t.takenAt,
      kind: "test",
      label: `Test · ${t.test.name}`,
      sub: `Resultat ${t.score.toFixed(1).replace(".", ",")}`,
    })),
    ...player.trackManSessions.slice(0, 4).map<TimelineItem>((tm) => ({
      when: tm.recordedAt,
      kind: "trackman",
      label: "TrackMan-økt",
      sub: `${tm.shotCount} slag`,
    })),
  ]
    .sort((a, b) => b.when.getTime() - a.when.getTime())
    .slice(0, 8);

  // HCP-trend: differanse mellom snitt-score første og siste halvdel av runder
  const recentRounds = player.rounds;
  let hcpDelta: number | null = null;
  if (recentRounds.length >= 4) {
    const half = Math.floor(recentRounds.length / 2);
    const newer = recentRounds.slice(0, half);
    const older = recentRounds.slice(half);
    const avgN = newer.reduce((a, r) => a + r.score, 0) / newer.length;
    const avgO = older.reduce((a, r) => a + r.score, 0) / older.length;
    hcpDelta = avgN - avgO;
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="grid grid-cols-1 gap-5 border-b border-border pb-5 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-6">
        <Avatar src={player.avatarUrl} initial={initial} />
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Elever · 360-profil
          </span>
          <h1 className="mt-1 font-display text-[22px] sm:text-[28px] md:text-[36px] font-bold italic leading-[1.1] tracking-tight">
            <em className="font-medium italic">
              {player.name.split(" ")[0]}
            </em>
            {player.name.split(" ").length > 1 && (
              <> {player.name.split(" ").slice(1).join(" ")}</>
            )}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
            <Pill tone="info">{tierLabel(player.tier)}</Pill>
            {player.homeClub && (
              <>
                <span className="text-border">·</span>
                <span>{player.homeClub}</span>
              </>
            )}
            {player.playingYears != null && (
              <>
                <span className="text-border">·</span>
                <span>{player.playingYears} år erfaring</span>
              </>
            )}
            <span className="text-border">·</span>
            <span className="truncate">{player.email}</span>
          </div>
          {player.ambition && (
            <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] text-foreground/80">
              {player.ambition}
            </p>
          )}
        </div>
        <div className="flex gap-7 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <QuickStat label="HCP" value={formatHcp(player.hcp)} />
          <QuickStat
            label="SG 12u"
            value={formatSg(sg.total)}
            highlight={sg.total != null && sg.total > 0}
          />
          <QuickStat
            label="Plan"
            value={String(completedSessions.length)}
            of={`/${totalPlanSessions}`}
          />
        </div>
      </header>

      {/* Side-actions */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Spiller-handlinger
        </span>
        <Link
          href={`/admin/innboks?tab=meldinger&to=${player.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <MessageSquare size={14} strokeWidth={1.5} />
          Send melding
        </Link>
        <Link
          href={`/admin/plans/new?player=${player.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ClipboardList size={14} strokeWidth={1.5} />
          Lag plan
        </Link>
        <Link
          href={`/admin/bookings/ny?player=${player.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <CalendarPlus size={14} strokeWidth={1.5} />
          Avtale time
        </Link>
        <Link
          href={`/admin/elever/${player.id}/rediger`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Pencil size={14} strokeWidth={1.5} />
          Rediger
        </Link>
        <Link
          href={`/admin/elever/${player.id}/ai`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Spør AI
        </Link>
      </div>

      {/* 4 stat-rich kort */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatRich
          label="HCP-trend"
          value={formatHcp(player.hcp)}
          delta={
            hcpDelta != null
              ? `${hcpDelta <= 0 ? "−" : "+"}${Math.abs(hcpDelta).toFixed(1).replace(".", ",")} snitt`
              : "for lite data"
          }
          deltaTone={
            hcpDelta != null && hcpDelta < 0 ? "up" : "flat"
          }
          sub={`${recentRounds.length} runder registrert`}
        />
        <StatRich
          label="Økter · 4 uker"
          value={String(sessions4w.length)}
          delta={`${plannedSessions.length} planlagt`}
          deltaTone="flat"
          sub={`${(sessions4w.reduce((a, s) => a + s.durationMin, 0) / 60).toFixed(1).replace(".", ",")} t totalt`}
        />
        <StatRich
          label="SG-snitt"
          value={formatSg(sg.total)}
          delta={`${sg.rundeAntall} runder`}
          deltaTone="flat"
          sub={
            sg.snittScore != null
              ? `Snitt-score ${sg.snittScore.toFixed(1).replace(".", ",")}`
              : "Ingen score-data"
          }
          valueColor={sg.total != null && sg.total > 0 ? "success" : undefined}
        />
        <StatRich
          label="Mål-progresjon"
          value={`${progressPct} %`}
          delta={`${completedSessions.length}/${totalPlanSessions}`}
          deltaTone={progressPct >= 75 ? "up" : "flat"}
          sub={`${player.trainingPlans.length} aktiv plan`}
        />
      </section>

      {/* Pyramide-donut */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pyramide-snitt · siste 12 uker
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Hvordan tiden fordeles
            </h3>
            <p className="mt-1 max-w-[360px] text-[12px] leading-[1.5] text-muted-foreground">
              Faktisk fordeling fra fullførte økter i aktive planer.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {totalPyrHours.toFixed(1).replace(".", ",")} t loggført
          </span>
        </div>
        {totalPyrMin === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
            Ingen loggførte økter siste 12 uker.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-9 md:grid-cols-[220px_1fr]">
            <div className="mx-auto">
              <Donut gradient={donutGradient} totalHours={totalPyrHours} />
            </div>
            <div className="flex flex-col gap-2.5">
              {PYR_KEYS.map((k, i) => (
                <TierRow
                  key={k}
                  color={PYR_META[k].color}
                  name={PYR_META[k].name}
                  sub={PYR_META[k].sub}
                  value={`${pyrPct[k]} %`}
                  delta={`${(pyrMinutes[k] / 60).toFixed(1).replace(".", ",")} t`}
                  last={i === PYR_KEYS.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Heatmap */}
      <section className="rounded-lg border border-border bg-card px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              12 ukers historikk · fordelt på pyramide-lag
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Hva ble trent når
            </h3>
            <p className="mt-1 text-[12px] leading-[1.5] text-muted-foreground">
              Mørkere = mer tid den uka.
            </p>
          </div>
          <div className="hidden items-center gap-4 text-[11px] font-medium text-muted-foreground sm:flex">
            <LegendCell
              color="hsl(var(--secondary))"
              border="hsl(var(--border))"
              label="0 t"
            />
            <LegendCell color="var(--color-pyr-fys-track)" label="1 t" />
            <LegendCell color="hsl(var(--primary))" label="3 t+" />
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-[48px_repeat(12,1fr)] gap-1.5">
          <div />
          {weeks.map((w, i) => (
            <div
              key={`${w}-${i}`}
              className="text-center font-mono text-[10px] font-medium text-muted-foreground"
            >
              u{w}
            </div>
          ))}
          {PYR_KEYS.map((k) => (
            <HmRow key={k} label={k} levels={heatLevels[k]} tier={k} />
          ))}
        </div>
      </section>

      {/* Tidslinje */}
      <section className="rounded-lg border border-border bg-card px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Aktivitet
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Siste hendelser
            </h3>
          </div>
          <Trophy
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-muted-foreground"
          />
        </div>
        {timeline.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
            Ingen registrerte hendelser ennå.
          </p>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-5">
            {timeline.map((item, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border border-border bg-card" />
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.sub}
                    </div>
                  </div>
                  <time className="shrink-0 font-mono text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                    {NB_FULL.format(item.when)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Siste live-økter — fullførte med rep-logging fra LiveTapper */}
      <section className="rounded-lg border border-border bg-card px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Live-økter · rep-logget i appen
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Siste live-økter
            </h3>
            <p className="mt-1 text-[12px] leading-[1.5] text-muted-foreground">
              Hva som faktisk ble logget — godkjente reps, varighet og fokus.
            </p>
          </div>
          {livecompleted.length > 0 && (
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {livecompleted.length}{" "}
              {livecompleted.length === 1 ? "økt" : "økter"}
            </span>
          )}
        </div>

        {livecompleted.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
            Spilleren har ikke fullført en live-økt ennå.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {livecompleted.map((s) => {
              const dato = s.scheduledAt.toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "short",
              });
              const varighet =
                s.log?.completedAt && s.log?.startedAt
                  ? Math.max(
                      1,
                      Math.round(
                        (s.log.completedAt.getTime() -
                          s.log.startedAt.getTime()) /
                          60000,
                      ),
                    )
                  : null;
              const harFeedback = !!s.log?.coachFeedback;
              return (
                <li
                  key={s.id}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-3 py-3"
                >
                  <div>
                    <div className="font-mono text-[12px] font-semibold leading-tight tabular-nums">
                      {dato}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
                      {varighet != null
                        ? `${varighet} min`
                        : `${s.durationMin} min planlagt`}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-sm"
                        style={{
                          background: `var(--color-pyr-${s.pyramidArea.toLowerCase()}, var(--color-primary))`,
                        }}
                      />
                      <Link
                        href={`/portal/tren/${s.id}`}
                        className="truncate text-[13px] font-medium text-foreground hover:text-primary"
                      >
                        {s.title}
                      </Link>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                      <span>{s.pyramidArea}</span>
                      {s.log?.csAchieved != null && (
                        <>
                          <span>·</span>
                          <span className="text-foreground">
                            {s.log.csAchieved} % godkjent
                          </span>
                        </>
                      )}
                      {s.log?.rating != null && (
                        <>
                          <span>·</span>
                          <span>{s.log.rating}/5</span>
                        </>
                      )}
                      {harFeedback && (
                        <>
                          <span>·</span>
                          <span className="text-primary">Feedback sendt</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/plans/${s.planId}#plan-okter`}
                    className="shrink-0 rounded-md border border-border bg-transparent px-2.5 py-1 font-mono text-[11px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Plan
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Siste runder (kompakt liste under tidslinje for hurtig oversikt) */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Siste runder
          </h3>
          {player.rounds.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
              Ingen registrerte runder.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {player.rounds.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-2.5 text-[13px]"
                >
                  <div className="min-w-0">
                    <span className="font-medium">{r.course.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      {NB.format(r.playedAt)}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums">
                    {r.score} · {formatSg(r.sgTotal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Aktive planer
          </h3>
          {player.trainingPlans.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
              Ingen aktive planer.
            </p>
          ) : (
            <ul className="space-y-2">
              {player.trainingPlans.map((p) => {
                const done = p.sessions.filter(
                  (s) => s.status === "COMPLETED"
                ).length;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2.5 text-[13px]"
                  >
                    <Link
                      href={`/admin/plans/${p.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {done} / {p.sessions.length} økter
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Foreldre — read-only liste over koblede foresatte */}
      <section
        aria-labelledby="foreldre-h"
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2
          id="foreldre-h"
          className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
        >
          Foreldre · {player.parentRelations.length}
        </h2>
        {player.parentRelations.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-[13px] text-muted-foreground">
            Ingen foresatte er koblet til spilleren.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {player.parentRelations.map((rel) => (
              <li key={rel.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[13px]">
                <div>
                  <div className="font-semibold">{rel.parent.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {rel.relationship}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{rel.parent.email}</div>
                  {rel.parent.phone ? <div>{rel.parent.phone}</div> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Avatar({
  src,
  initial,
}: {
  src: string | null;
  initial: string;
}) {
  return (
    <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-display text-[36px] font-semibold leading-none">
          {initial}
        </span>
      )}
    </div>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "info" | "success" | "muted" | "warning";
  children: React.ReactNode;
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    info: "bg-primary/10 text-primary",
    success: "bg-pyr-tek/10 text-pyr-tek",
    warning: "bg-pyr-spill/15 text-pyr-spill",
    muted: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function QuickStat({
  label,
  value,
  of,
  highlight,
}: {
  label: string;
  value: string;
  of?: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums ${
          highlight ? "text-pyr-tek" : ""
        }`}
      >
        {value}
        {of && (
          <span className="text-[14px] text-muted-foreground">{of}</span>
        )}
      </div>
    </div>
  );
}

function Donut({
  gradient,
  totalHours,
}: {
  gradient: string;
  totalHours: number;
}) {
  return (
    <div
      className="relative h-[220px] w-[220px] rounded-full"
      style={{ background: gradient }}
    >
      <div
        className="absolute inset-9 rounded-full bg-card"
        style={{ boxShadow: "inset 0 0 0 1px hsl(var(--border))" }}
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="font-mono text-[32px] font-medium leading-none tabular-nums">
          {totalHours.toFixed(1).replace(".", ",")}t
        </div>
        <div className="mt-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.10em] text-muted-foreground">
          siste 12 uker
        </div>
      </div>
    </div>
  );
}

function TierRow({
  color,
  name,
  sub,
  value,
  delta,
  last = false,
}: {
  color: string;
  name: string;
  sub: string;
  value: string;
  delta: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 py-2 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div
        className="h-3 w-3 rounded-[3px]"
        style={{ background: color }}
      />
      <div>
        <div className="text-[13px] font-semibold leading-none">{name}</div>
        <div className="mt-1 text-[11px] leading-none text-muted-foreground">
          {sub}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[16px] font-semibold leading-none tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-[10px] font-medium leading-none text-muted-foreground">
          {delta}
        </div>
      </div>
    </div>
  );
}

function StatRich({
  label,
  value,
  delta,
  sub,
  valueColor,
  deltaTone = "up",
}: {
  label: string;
  value: string;
  delta: string;
  sub: string;
  valueColor?: "success";
  deltaTone?: "up" | "flat";
}) {
  const deltaStyle =
    deltaTone === "up"
      ? "bg-pyr-tek/10 text-pyr-tek"
      : "bg-secondary text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${deltaStyle}`}
        >
          {delta}
        </span>
      </div>
      <div
        className={`mt-3.5 mb-1.5 font-mono text-[28px] font-medium leading-none tabular-nums -tracking-tight ${
          valueColor === "success"
            ? "text-pyr-tek"
            : ""
        }`}
      >
        {value}
      </div>
      <div className="text-[12px] leading-[1.4] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

function LegendCell({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3.5 w-3.5 rounded-[3px]"
        style={{
          background: color,
          border: border ? `1px solid ${border}` : undefined,
        }}
      />
      {label}
    </span>
  );
}

function HmRow({
  label,
  levels,
  tier,
}: {
  label: string;
  levels: number[];
  tier: PyrKey;
}) {
  const colorFor = (lvl: number) => {
    if (lvl === 0)
      return "bg-secondary border border-border";
    if (tier === "FYS") {
      return [
        "bg-pyr-fys/10",
        "bg-pyr-fys/25",
        "bg-pyr-fys/55",
        "bg-pyr-fys",
      ][lvl - 1];
    }
    if (tier === "SLAG") {
      return [
        "bg-pyr-slag/20",
        "bg-pyr-slag/40",
        "bg-pyr-slag/55",
        "bg-accent",
      ][lvl - 1];
    }
    if (tier === "SPILL") {
      return [
        "bg-pyr-spill/10",
        "bg-pyr-spill/25",
        "bg-pyr-spill/55",
        "bg-pyr-spill",
      ][lvl - 1];
    }
    if (tier === "TURN") {
      return [
        "bg-pyr-turn/10",
        "bg-pyr-turn/25",
        "bg-pyr-turn/55",
        "bg-pyr-turn",
      ][lvl - 1];
    }
    return [
      "bg-primary/10",
      "bg-primary/25",
      "bg-primary/50",
      "bg-primary",
    ][lvl - 1];
  };
  return (
    <>
      <div className="flex items-center font-mono text-[10px] font-semibold text-muted-foreground">
        {label}
      </div>
      {levels.map((lvl, i) => (
        <div
          key={i}
          className={`aspect-square rounded-[4px] ${colorFor(lvl)}`}
        />
      ))}
    </>
  );
}
