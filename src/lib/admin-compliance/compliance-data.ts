/**
 * Data-loader for Compliance-sporing (/admin/analyse?view=compliance).
 *
 * Stall-analyse: plan møter virkelighet. Tre nivåer i samme språk —
 *   1) spillerpanel-modul: plan-fullføring for ÉN spiller (donut + uke-strip + akse-barometer)
 *   2) stall-tabell: compliance% per spiller med ring + sparkline
 *   3) drill-fullføring: planlagte drills i siste loggede økt
 *
 * Ekte Prisma-data:
 *   - V2, Workbench og eldre synlige planøkter → minutter gjennomført / planlagt, siste fire uker
 *   - trainingPlanSessionLog (startedAt/completedAt) → sist-logget + uke-strip
 *   - user (role=PLAYER) → per-spiller-rad
 *   - sessionDrill (planlagte reps/sett) → drill-fullføring i siste loggede økt
 *
 * Mangler ekte tall → tom/utledet state. ALDRI falske tall.
 */

import { etterlevelse, erForfaltEtterlevelseOkt, etterlevelseFra } from "@/lib/domain/etterlevelse";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { somEtterlevelseOkt } from "@/lib/portal/etterlevelse-data";
import { startOfWeek, ukenummer } from "@/lib/uke-helpers";
import type { TodaySession } from "@/app/portal/actions";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

export type ComplianceAxis = "fys" | "tek" | "slag" | "spill" | "turn";

/** Status-bånd for compliance% mot mål (100%). */
export type ComplianceBand = "bad" | "warn" | "ok" | "over";

const PYR_TO_AXIS: Record<PyramidArea, ComplianceAxis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

const AXIS_LABEL: Record<ComplianceAxis, string> = {
  fys: "Fysisk",
  tek: "Teknisk",
  slag: "Slag",
  spill: "Spill",
  turn: "Turnering",
};

/** Rekkefølge topp→bunn i barometeret (turnering øverst, fysisk nederst). */
const AXIS_ORDER: ComplianceAxis[] = ["turn", "spill", "slag", "tek", "fys"];

function bandFor(pct: number | null): ComplianceBand {
  if (pct === null) return "warn";
  if (pct >= 100) return "over";
  if (pct >= 75) return "ok";
  if (pct >= 60) return "warn";
  return "bad";
}

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pct(done: number, planned: number): number {
  if (planned <= 0) return 0;
  return Math.round((done / planned) * 100);
}

const DAY_MS = 86_400_000;

function daysSince(from: Date, now: Date): number {
  return Math.floor((now.getTime() - from.getTime()) / DAY_MS);
}

/** "I dag" / "I går" / "N d siden" — kompakt, mono-vennlig. */
function lastLogLabel(d: Date | null, now: Date): string {
  if (!d) return "Aldri";
  const diff = daysSince(d, now);
  if (diff <= 0) return "I dag";
  if (diff === 1) return "I går";
  return `${diff} d siden`;
}

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function dateShort(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

// ── Section 1: spillerpanel-modul ──────────────────────────────
export type AxisBar = {
  axis: ComplianceAxis;
  label: string;
  done: number;
  planned: number;
  pct: number;
  band: ComplianceBand;
  /** delta = gjennomførte − planlagte minutter (negativ = bak plan). */
  delta: number;
};

export type WeekBar = {
  label: string;
  done: number;
  planned: number;
  /** Fyllingshøyde 0–1 (done/planned, kappet på 1). */
  fill: number;
  band: ComplianceBand;
  isNow: boolean;
};

export type PlayerPanel = {
  playerId: string;
  playerName: string;
  initials: string;
  totalPlanned: number;
  totalDone: number;
  pct: number | null;
  band: ComplianceBand;
  axes: AxisBar[];
  weeks: WeekBar[];
  /** Coach-lesbar diagnose utledet fra aksene — null hvis ingen plan. */
  diagnosis: string | null;
};

// ── Section 2: stall-tabell ────────────────────────────────────
export type StallRow = {
  playerId: string;
  playerName: string;
  initials: string;
  hcp: number | null;
  homeClub: string | null;
  planned: number;
  done: number;
  pct: number | null;
  band: ComplianceBand;
  lastLog: string;
  lastLogBand: "ok" | "warn" | "bad";
  /** Uke-for-uke fullføringsgrad (0–1) til sparkline. */
  spark: number[];
  /** Antall dager siden siste logg (for sortering/varsel). null = aldri. */
  staleDays: number | null;
};

// ── Section 3: drill-fullføring ────────────────────────────────
export type DrillRow = {
  id: string;
  name: string;
  axis: ComplianceAxis | null;
  axisLabel: string | null;
  /** Planlagt reps/sett som fritekst (fra SessionDrill.repsSets eller reps×sett). */
  planned: string;
  reps: number | null;
  sets: number | null;
  done: boolean;
};

export type DrillSession = {
  sessionId: string;
  title: string;
  playerName: string;
  dateLabel: string;
  durationMin: number;
  plannedCount: number;
  doneCount: number;
  drills: DrillRow[];
} | null;

export type ComplianceData = {
  periodLabel: string;
  windowDays: number;
  panel: PlayerPanel | null;
  /** Spillervalg for panelet (id + navn). */
  players: { id: string; name: string }[];
  selectedPlayerId: string | null;
  stall: StallRow[];
  cohortAvg: number | null;
  cohortMedian: number | null;
  staleCount: number;
  drillSession: DrillSession;
};

type Session = TodaySession;

/** Compliance% per akse for et sett økter. */
function axesFromSessions(sessions: Session[], now: Date): AxisBar[] {
  return AXIS_ORDER.flatMap(axis => {
    const e = etterlevelse(sessions.filter(s => PYR_TO_AXIS[s.pyramidArea] === axis).map(somEtterlevelseOkt), now);
    if (e.pct === null) return [];
    return [{ axis, label: AXIS_LABEL[axis], done: e.gjennomfortMinutter,
      planned: e.planlagtMinutter, pct: e.pct, band: bandFor(e.pct),
      delta: e.gjennomfortMinutter - e.planlagtMinutter }];
  });
}

/** Uke-for-uke fullføring (siste 8 uker, mandag-start) for én spillers økter. */
function weeksFromSessions(sessions: Session[], now: Date, weekCount: number): WeekBar[] {
  const monday = startOfWeek(now);
  return Array.from({ length: weekCount }, (_, idx) => {
    // Søk mandag i Oslo via felles uke-hjelper, også over sommertidsskift.
    const start = startOfWeek(new Date(monday.getTime() - (weekCount - 1 - idx) * 7 * DAY_MS + 12 * 3_600_000));
    const end = startOfWeek(new Date(start.getTime() + 7 * DAY_MS + 12 * 3_600_000));
    const inWeek = sessions.filter(s => s.startTime >= start && s.startTime < end && s.endTime <= now);
    const planned = inWeek.reduce((sum, s) => sum + s.durationMin, 0);
    const done = inWeek.filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + s.durationMin, 0);
    return { label: `U${ukenummer(start)}`, done, planned,
      fill: planned === 0 ? 0 : Math.min(1, done / planned), band: bandFor(pct(done, planned)),
      isNow: idx === weekCount - 1 };
  });
}

function diagnose(axes: AxisBar[]): string | null {
  if (axes.length === 0) return null;
  const behind = [...axes].filter((a) => a.delta < 0).sort((a, b) => a.delta - b.delta);
  const over = axes.filter((a) => a.pct >= 100);
  if (behind.length === 0) {
    return over.length > 0
      ? `Hele planen er på sporet eller over. ${over[0].label.toLowerCase()} ligger over plan — vurder å øke kravet.`
      : "Hele planen er på sporet.";
  }
  const worst = behind[0];
  const base = `${worst.label} er ${Math.abs(worst.delta)} minutter bak plan (${worst.pct}% fullført).`;
  if (over.length > 0) {
    return `${base} ${over[0].label} er over plan — vurder å flytte volum dit det trengs.`;
  }
  return `${base} Sjekk om planen treffer hverdagen, eller følg opp spilleren.`;
}

export async function loadComplianceData(opts: {
  windowDays: number;
  periodLabel: string;
  now?: Date;
  selectedPlayerId?: string;
  viewer: { id: string; role: string };
}): Promise<ComplianceData> {
  const { viewer } = opts;
  const windowDays = 28;
  const periodLabel = "Siste fire uker";
  const now = opts.now ?? new Date();
  const from = etterlevelseFra(now);
  const weekCount = 8;
  const weekWindowStart = startOfWeek(new Date(startOfWeek(now).getTime() - 49 * DAY_MS + 12 * 3_600_000));
  const dataFrom = from < weekWindowStart ? from : weekWindowStart;

  // Alle PLAYER-spillere
  const players = await prisma.user.findMany({
    where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] },
    select: { id: true, name: true, hcp: true, homeClub: true },
    orderBy: { name: "asc" },
  });

  if (players.length === 0) {
    return {
      periodLabel,
      windowDays,
      panel: null,
      players: [],
      selectedPlayerId: null,
      stall: [],
      cohortAvg: null,
      cohortMedian: null,
      staleCount: 0,
      drillSession: null,
    };
  }

  const playerIds = players.map((p) => p.id);

  // Samme synlige økter som spilleren; bare ID-er fra coach-scope ovenfor.
  const byPlayer = new Map<string, { periodSessions: Session[]; weekSessions: Session[]; lastLog: Date | null }>();
  for (let i = 0; i < playerIds.length; i += 8) {
    await Promise.all(playerIds.slice(i, i + 8).map(async id => {
      const sessions = await loadVisibleSessionRange(id, dataFrom.toISOString(), now.toISOString());
      const due = sessions.filter(s => erForfaltEtterlevelseOkt(somEtterlevelseOkt(s), now));
      // Bruk registrerte loggtider, aldri planlagt slutt som loggtid.
      const planIds = sessions.flatMap(s => s.model === "plan" ? [s.id] : s.planSessionId ? [s.planSessionId] : []);
      const v2Ids = sessions.filter(s => s.model === "v2").map(s => s.id);
      const [planLogs, v2Log] = await Promise.all([
        planIds.length === 0 ? [] : prisma.trainingPlanSessionLog.findMany({
          where: { sessionId: { in: planIds } }, select: { startedAt: true, completedAt: true },
        }),
        v2Ids.length === 0 ? null : prisma.drillLogV2.findFirst({
          where: { loggedBy: id, drill: { sessionId: { in: v2Ids } }, loggedAt: { lte: now } },
          orderBy: { loggedAt: "desc" }, select: { loggedAt: true },
        }),
      ]);
      const lastLog = [...planLogs.map(l => l.completedAt ?? l.startedAt), ...(v2Log ? [v2Log.loggedAt] : [])]
        .filter(d => d <= now).reduce<Date | null>((latest, d) => !latest || d > latest ? d : latest, null);
      byPlayer.set(id, { periodSessions: due, weekSessions: sessions, lastLog });
    }));
  }

  // ── Section 2: stall-tabell ──────────────────────────────────
  const stall: StallRow[] = players.map((p) => {
    const b = byPlayer.get(p.id)!;
    const e = etterlevelse(b.periodSessions.map(somEtterlevelseOkt), now);
    const planned = e.planlagtMinutter;
    const done = e.gjennomfortMinutter;
    const p100 = e.pct;
    const weeks = weeksFromSessions(b.weekSessions, now, weekCount);
    const stale = b.lastLog ? daysSince(b.lastLog, now) : null;
    const lastLogBand: StallRow["lastLogBand"] =
      stale == null || stale >= 14 ? "bad" : stale >= 7 ? "warn" : "ok";
    return {
      playerId: p.id,
      playerName: p.name,
      initials: initials(p.name),
      hcp: p.hcp,
      homeClub: p.homeClub,
      planned,
      done,
      pct: p100,
      band: bandFor(p100),
      lastLog: lastLogLabel(b.lastLog, now),
      lastLogBand,
      spark: weeks.map((w) => w.fill),
      staleDays: stale,
    };
  });

  // Sorter: bak plan først (lavest pct øverst), men spillere uten plan til slutt.
  stall.sort((a, b) => {
    if (a.planned === 0 && b.planned === 0) return a.playerName.localeCompare(b.playerName, "nb");
    if (a.planned === 0) return 1;
    if (b.planned === 0) return -1;
    return (a.pct ?? 0) - (b.pct ?? 0);
  });

  const withPlan = stall.filter((s) => s.planned > 0);
  const cohortAvg =
    withPlan.length > 0
      ? Math.round(withPlan.reduce((sum, s) => sum + (s.pct ?? 0), 0) / withPlan.length)
      : null;
  const sortedPct = withPlan.flatMap((s) => s.pct === null ? [] : [s.pct]).sort((a, b) => a - b);
  const cohortMedian =
    sortedPct.length > 0
      ? sortedPct.length % 2 === 1
        ? sortedPct[(sortedPct.length - 1) / 2]
        : Math.round((sortedPct[sortedPct.length / 2 - 1] + sortedPct[sortedPct.length / 2]) / 2)
      : null;
  const staleCount = stall.filter((s) => s.staleDays == null || s.staleDays >= 14).length;

  // ── Section 1: spillerpanel-modul ────────────────────────────
  // Valgt spiller: eksplisitt valg, ellers spilleren med flest planlagte økter
  // (mest meningsfull panel), ellers første spiller.
  let selectedId = opts.selectedPlayerId && byPlayer.has(opts.selectedPlayerId)
    ? opts.selectedPlayerId
    : null;
  if (!selectedId) {
    const ranked = [...stall].filter((s) => s.planned > 0).sort((a, b) => b.planned - a.planned);
    selectedId = ranked[0]?.playerId ?? players[0].id;
  }

  const selectedPlayer = players.find((p) => p.id === selectedId)!;
  const selBucket = byPlayer.get(selectedId)!;
  const panelAxes = axesFromSessions(selBucket.periodSessions, now);
  const panelE = etterlevelse(selBucket.periodSessions.map(somEtterlevelseOkt), now);
  const panelPlanned = panelE.planlagtMinutter;
  const panelDone = panelE.gjennomfortMinutter;
  const panelPct = panelE.pct;

  const panel: PlayerPanel = {
    playerId: selectedPlayer.id,
    playerName: selectedPlayer.name,
    initials: initials(selectedPlayer.name),
    totalPlanned: panelPlanned,
    totalDone: panelDone,
    pct: panelPct,
    band: bandFor(panelPct),
    axes: panelAxes,
    weeks: weeksFromSessions(selBucket.weekSessions, now, weekCount),
    diagnosis: panelPlanned > 0 ? diagnose(panelAxes) : null,
  };

  // ── Section 3: drill-fullføring i siste loggede økt ──────────
  // Siste økt for valgt spiller som har en logg (startet eller fullført).
  const latestLogged = await prisma.trainingPlanSession.findFirst({
    where: {
      plan: { userId: selectedId, isActive: true, status: { in: ["ACCEPTED", "ACTIVE", "PAUSED"] } },
      scheduledAt: { lt: now },
      log: { isNot: null },
    },
    orderBy: { scheduledAt: "desc" },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      status: true,
      plan: { select: { user: { select: { name: true } } } },
      log: { select: { completedAt: true } },
      drills: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          repsSets: true,
          reps: true,
          sets: true,
          exercise: { select: { name: true, pyramidArea: true } },
        },
      },
    },
  });

  let drillSession: DrillSession = null;
  if (latestLogged && latestLogged.drills.length > 0) {
    // Økt er fullført → alle planlagte drills regnes gjennomført (ingen per-drill-logg
    // finnes i plan-session-modellen). Ellers: ikke fullført → ikke markert.
    const sessionDone = latestLogged.status === "COMPLETED" || latestLogged.log?.completedAt != null;
    const drills: DrillRow[] = latestLogged.drills.map((d) => {
      const axis = d.exercise?.pyramidArea ? PYR_TO_AXIS[d.exercise.pyramidArea] : null;
      const planned =
        d.repsSets?.trim() ||
        [d.reps ? `${d.reps} rep` : null, d.sets ? `${d.sets} sett` : null]
          .filter(Boolean)
          .join(" · ") ||
        "—";
      return {
        id: d.id,
        name: d.exercise?.name ?? "Drill",
        axis,
        axisLabel: axis ? AXIS_LABEL[axis] : null,
        planned,
        reps: d.reps,
        sets: d.sets,
        done: sessionDone,
      };
    });
    drillSession = {
      sessionId: latestLogged.id,
      title: latestLogged.title,
      playerName: latestLogged.plan.user.name,
      dateLabel: dateShort(latestLogged.scheduledAt),
      durationMin: latestLogged.durationMin,
      plannedCount: drills.length,
      doneCount: drills.filter((d) => d.done).length,
      drills,
    };
  }

  return {
    periodLabel,
    windowDays,
    panel,
    players: players.map((p) => ({ id: p.id, name: p.name })),
    selectedPlayerId: selectedId,
    stall,
    cohortAvg,
    cohortMedian,
    staleCount,
    drillSession,
  };
}
