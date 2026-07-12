/**
 * Data-adapter for v10-Workbench (delt kjerne).
 *
 * Henter ekte Prisma-data (TrainingPlan + TrainingPlanSession + SessionDrill +
 * Goal + TournamentEntry) for én bruker og mapper til `WorkbenchData` — formen
 * `<Workbench data>` konsumerer. Spiller-variant (innlogget bruker) og
 * coach-variant (spiller-id).
 *
 * Prinsipp (W5b): ekte data der schemaet gir det. Felter uten kilde i
 * datamodellen (SG-tall, 8-ukers trender, compliance, CS-vanske, periode-mål,
 * sesong-tre-detaljer, inspector-valgt-økt) er IKKE med her — komponentene faller
 * tilbake til v10-demo for de flatene. Ingen oppdiktede tall.
 *
 * Mønsteret speiler de eksisterende loaderne
 * (src/lib/portal-workbench/player-workbench-data.tsx og
 * src/lib/admin-workbench/workbench-data.tsx) som allerede traff riktige modeller.
 *
 * Merknad: Adapteren leser INGEN forretningskritiske Prisma JSON-felter
 * (TrainingPlanSession.liveSnapshot / Goal.payload brukes ikke her), så det er
 * ingen `as unknown as Type`-cast å validere med zod. Hvis en fremtidig utvidelse
 * leser slike blobs, MÅ de zod-`safeParse`-valideres (prosjekt-regel).
 */

import { prisma } from "@/lib/prisma";
import type { LPhase, PyramidArea, SkillArea } from "@/generated/prisma/client";
import { PYR_REKKEFOLGE } from "@/lib/pyramide";
import { adherencePct, oktCompliance } from "@/lib/workbench/compliance";
import { kategoriFraFritekst, SG_FOKUS_LABEL, type WorkbenchFokus } from "@/lib/workbench/fokus";
import { beregnSgGap } from "@/lib/workbench/sg-gap";
import { findActivePeriod } from "@/lib/workbench/period-lookup";
import { canonDeviationChip } from "@/lib/workbench/canon-period-adjustment";
import {
  mergeWeekSessions,
  type V2WeekSessionInput,
  type WeekSessionRow,
  type PlanWeekSessionInput,
} from "@/lib/workbench/merge-week-sessions";
import type {
  Axis,
  WeekDay,
  WeekEvent,
  DirBDayData,
  DirBRowData,
} from "@/lib/workbench/week-types";

// ───────── Eksportert data-form ─────────
// Hver del er optional: mangler kilde → komponenten bruker v10-demo.
export type WorkbenchPlanTemplate = {
  id: string;
  name: string;
  lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
  varighetUker: number;
  usageCount: number;
  sessionCount: number;
  /** Snitt SG-Total-delta fra PlanEffectiveness. null = ingen effekt-data ennå. */
  effectivenessAvg: number | null;
};

export type WorkbenchGroupSlot = {
  id: string;
  title: string;
  groupName: string;
  startAt: string;
  endAt: string;
  location: string | null;
  dayIndex: number;
};

export type WorkbenchPaletteItem = {
  pid: string;
  title: string;
  dur: number;
  cat: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  /** SG-tagging fra PlanTemplateSession.skillArea — brukes til fokus-rangering. */
  skillArea: SkillArea | null;
};

export type WorkbenchData = {
  /** Uke-header (A · WeekView): MAN..FRE med dato + i-dag-flagg. */
  weekHead?: { dow: string; date: string; today: boolean; sub: string }[];
  /** Dag-kolonner med posisjonerte økt-blokker (A · WeekView). */
  weekDays?: WeekDay[];
  /** Vertikal dag-for-dag-agenda (B · Tidslinje). */
  dirBDays?: DirBDayData[];
  /** Kanban-kolonner per akse (A + B). */
  kanbanCols?: {
    key: Axis;
    lbl: string;
    ct: number;
    cards: { day: string; nm: string; meta: string }[];
  }[];
  /** Timer per akse denne uka (statusbar + dashboard-pie). */
  axisHours?: { ax: Axis; lbl: string; hours: number }[];
  /** Sidebar: kommende turneringer. */
  tournaments?: { tn: string; td: string; soon?: boolean }[];
  /** Sidebar: aktive mål. */
  goals?: {
    gn: string;
    gm: string;
    ax: Axis;
    targetValue?: number | null;
    progressPct?: number | null;
  }[];
  /** Sidebar/dashboard: pyramide-fordeling (timer per akse siste 30 d). */
  pyramid?: { lbl: string; ax: Axis; hours: number; pct: number }[];
  /** Topp-tall: uke-nummer, antall økter, planlagte timer. */
  summary?: { weekNumber: number; sessionCount: number; plannedHours: number };
  /** Plan-adherence for uka (% gjennomførte minutter av forfalte). Null = ingen forfalte økter. */
  adherencePct?: number | null;
  /** Aktivt fokus: coachens PeriodBlock.focus, ellers beregnet SG-gap. Null = ingen kilde. */
  fokus?: WorkbenchFokus | null;
  /** Ukevolum-mål fra spillerens aktive PeriodBlock (min/max minutter). Null-felt = ikke satt. */
  volTarget?: { min: number | null; max: number | null };
  /** Periodetype for spillerens aktive PeriodBlock akkurat nå — brukes til malanbefaling. */
  activePeriodLPhase?: LPhase | null;
  /** CANON-avvikstekst for aktiv periode (anbefaling, ikke sperre) — null når alt stemmer. */
  canonChip?: string | null;
  /** Sesong-perioder fra SeasonPlan.periodBlocks (Gantt/Årsplan). */
  seasonBlocks?: {
    id: string;
    lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
    startDate: string;
    endDate: string;
    focus?: string | null;
  }[];
  /** Turneringer med konkret dato for kalender/Gantt (ikke bare «om N dg»). */
  tournamentCalendar?: {
    title: string;
    startDate: string;
    daysUntil: number;
    priority: "MAJOR" | "NORMAL" | "LOCAL";
  }[];
  /** Planmaler for hub-fanen Maler. */
  planTemplates?: WorkbenchPlanTemplate[];
  /** Standardøkter fra mal-bibliotek (hub-fanen Standardøkter). */
  paletteItems?: WorkbenchPaletteItem[];
  /** Felles gruppetider denne uka (GroupSchedule — tid/sted delt, innhold per spiller). */
  groupSlots?: WorkbenchGroupSlot[];
  /** Om ukedata inkluderer TrainingSessionV2 (lanserings-spor B). */
  usesV2Sessions?: boolean;
  /** Uke-offset denne dataen er hentet for (0 = inneværende uke). */
  weekOffset?: number;
  /** Mandag 00:00 (ISO) for uka dataen gjelder — UI utleder datotall + i-dag. */
  weekStartISO?: string;
  /** Måneden uka ligger i: én rad per dag MED økter (plan + v2, dublett-luket).
   *  UI-en bygger selve kalendergriden fra weekStartISO — dette er kun innholdet. */
  monthDays?: { dateISO: string; count: number; axes: { ax: Axis; min: number }[] }[];
};

// ───────── Konstanter ─────────
const DOW = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const MND_SHORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const MND_UPPER = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];

const PYR_TONE: Record<PyramidArea, Axis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};
const PYR_SHORT: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};
const ENV_LABEL: Record<string, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjem",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86_400_000));
}

function mondayOf(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

/** Minutter → kompakt "30 m" / "1 t" / "1 t 30 m". */
function fmtDur(min: number): string {
  if (min < 60) return `${min} m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} t` : `${h} t ${m} m`;
}

// Felles select for uke-økter — samme felt-sett som de eksisterende loaderne.
const SESSION_SELECT = {
  id: true,
  scheduledAt: true,
  durationMin: true,
  title: true,
  pyramidArea: true,
  environment: true,
  status: true,
  _count: { select: { drills: true } },
} as const;

/**
 * Kjernen: gitt en bruker-id, bygg `WorkbenchData` fra ekte Prisma-data.
 * Returnerer `null` hvis brukeren ikke finnes (coach-rute → notFound()).
 */
export async function loadWorkbenchData(
  userId: string,
  weekOffset = 0,
): Promise<WorkbenchData | null> {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) return null;

  const offset = Math.trunc(weekOffset);
  const now = new Date();
  // Uka brukeren ser på: inneværende uke forskjøvet `offset` uker.
  const weekStart = mondayOf(now);
  weekStart.setDate(weekStart.getDate() + offset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekStartISO = weekStart.toISOString();
  // 30-dagers pyramide-vindu og «i dag» følger ALLTID dagens dato, ikke den
  // navigerte uka — kun uke-spesifikke spørringer skifter med offset.
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  // Månedsvinduet følger den NAVIGERTE uka (weekStart), ikke dagens dato —
  // månedsvisningen skal vise måneden brukeren faktisk ser på.
  const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const monthEnd = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 1);

  const year = now.getFullYear();

  const [
    weekSessions,
    last30Sessions,
    goals,
    entries,
    player,
    seasonPlan,
    yearTournaments,
    v2WeekSessions,
    groupMemberships,
    planTemplates,
    monthPlanSessions,
    monthV2Sessions,
  ] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId }, scheduledAt: { gte: weekStart, lt: weekEnd } },
      orderBy: { scheduledAt: "asc" },
      select: SESSION_SELECT,
    }),
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId }, scheduledAt: { gte: tretti, lt: now } },
      select: { pyramidArea: true, durationMin: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        targetValue: true,
        payload: true,
      },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        OR: [{ tournament: { startDate: { gte: now } } }, { manualDate: { gte: now } }],
      },
      orderBy: { createdAt: "asc" },
      take: 4,
      select: {
        id: true,
        manualName: true,
        manualDate: true,
        tournament: { select: { name: true, startDate: true, location: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
    prisma.seasonPlan.findFirst({
      where: { userId, year },
      include: { periodBlocks: { orderBy: { startDate: "asc" } } },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        OR: [
          { tournament: { startDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } } },
          { manualDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        manualName: true,
        manualDate: true,
        priority: true,
        tournament: { select: { name: true, startDate: true, location: true } },
      },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: userId, startTime: { gte: weekStart, lt: weekEnd } },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        generertFraId: true,
        drills: { select: { pyramide: true } },
        practiceType: true,
        status: true,
      },
    }),
    prisma.groupMember.findMany({
      where: { userId },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            schedules: {
              where: { startAt: { gte: weekStart, lt: weekEnd } },
              orderBy: { startAt: "asc" },
              select: {
                id: true,
                title: true,
                startAt: true,
                endAt: true,
                location: true,
              },
            },
          },
        },
      },
    }),
    prisma.planTemplate.findMany({
      where: { approved: true },
      orderBy: [{ usageCount: "desc" }, { name: "asc" }],
      take: 12,
      select: {
        id: true,
        name: true,
        lPhase: true,
        varighetUker: true,
        usageCount: true,
        effectivenessAvg: true,
        _count: { select: { sessions: true } },
        sessions: {
          take: 8,
          orderBy: [{ ukeNr: "asc" }, { dagNr: "asc" }],
          select: { title: true, varighetMin: true, pyramidArea: true, skillArea: true },
        },
      },
    }),
    // Månedsaggregat (månedsvisningen i Workbench-zoomen): kun feltene
    // dag-cellene trenger. Plan + v2 lukes for dubletter via generertFraId
    // under, samme regel som mergeWeekSessions.
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId }, scheduledAt: { gte: monthStart, lt: monthEnd } },
      select: { id: true, scheduledAt: true, durationMin: true, pyramidArea: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: userId, startTime: { gte: monthStart, lt: monthEnd } },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        generertFraId: true,
        drills: { select: { pyramide: true } },
        practiceType: true,
      },
    }),
  ]);

  // Aktiv periode-blokk (dagens dato innenfor start/slutt) → ukevolum-mål + coach-fokus.
  // Gjenbruker seasonPlan.periodBlocks (allerede hentet til Gantt) — ingen egen spørring.
  const activePeriodBlock = seasonPlan ? findActivePeriod(seasonPlan.periodBlocks, now) : null;

  const volTarget =
    activePeriodBlock && (activePeriodBlock.weeklyVolMin != null || activePeriodBlock.weeklyVolMax != null)
      ? { min: activePeriodBlock.weeklyVolMin, max: activePeriodBlock.weeklyVolMax }
      : undefined;

  const templateRowsEarly: WorkbenchPlanTemplate[] = planTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    lPhase: t.lPhase,
    varighetUker: t.varighetUker,
    usageCount: t.usageCount,
    sessionCount: t._count.sessions,
    effectivenessAvg: t.effectivenessAvg ?? null,
  }));

  const groupSlotsEarly: WorkbenchGroupSlot[] = [];
  for (const m of groupMemberships) {
    for (const sch of m.group.schedules) {
      groupSlotsEarly.push({
        id: sch.id,
        title: sch.title,
        groupName: m.group.name,
        startAt: sch.startAt.toISOString(),
        endAt: sch.endAt.toISOString(),
        location: sch.location,
        dayIndex: (sch.startAt.getDay() + 6) % 7,
      });
    }
  }

  // Tom uke → eksplisitt tom tilstand, men behold maler/gruppetider.
  // KUN for inneværende uke: når brukeren har navigert til en annen uke skal
  // grid-en alltid rendres (med tomme dager) så hen kan dra inn økter / navigere
  // tilbake — ellers ville en tom framtidsuke vist den globale «ingen plan»-flaten.
  if (
    offset === 0 &&
    weekSessions.length === 0 &&
    v2WeekSessions.length === 0 &&
    last30Sessions.length === 0 &&
    goals.length === 0 &&
    entries.length === 0
  ) {
    return {
      summary: { weekNumber: isoWeek(weekStart), sessionCount: 0, plannedHours: 0 },
      planTemplates: templateRowsEarly.length > 0 ? templateRowsEarly : undefined,
      groupSlots: groupSlotsEarly.length > 0 ? groupSlotsEarly : undefined,
      usesV2Sessions: false,
      weekOffset: offset,
      weekStartISO,
    };
  }

  const mergedSessions = mergeWeekSessions(
    weekSessions as PlanWeekSessionInput[],
    v2WeekSessions as V2WeekSessionInput[],
  );

  // ── Månedsaggregat: plan + v2 (dublett-luket via generertFraId, samme regel
  // som mergeWeekSessions), gruppert per lokal dato. Akse for v2 utledes som i
  // v2ToWeekRow (topp-drill-pyramide, ellers practiceType-fallback).
  const monthPlanIds = new Set(monthPlanSessions.map((s) => s.id));
  type MndCelle = { count: number; axes: Map<Axis, number> };
  const mndMap = new Map<string, MndCelle>();
  const localDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const leggTilMnd = (dato: Date, ax: Axis, min: number) => {
    const key = localDateKey(dato);
    const celle = mndMap.get(key) ?? { count: 0, axes: new Map<Axis, number>() };
    celle.count += 1;
    celle.axes.set(ax, (celle.axes.get(ax) ?? 0) + min);
    mndMap.set(key, celle);
  };
  for (const s of monthPlanSessions) {
    leggTilMnd(s.scheduledAt, PYR_TONE[s.pyramidArea], s.durationMin);
  }
  for (const v of monthV2Sessions) {
    if (v.generertFraId && monthPlanIds.has(v.generertFraId)) continue;
    const topDrill = v.drills[0]?.pyramide;
    const area = (
      topDrill && ["FYS", "TEK", "SLAG", "SPILL", "TURN"].includes(topDrill)
        ? topDrill
        : v.practiceType === "KONKURRANSE"
          ? "TURN"
          : v.practiceType === "SPILL_TEST"
            ? "SPILL"
            : v.practiceType === "RANDOM"
              ? "SLAG"
              : "TEK"
    ) as PyramidArea;
    const min = Math.max(5, Math.round((v.endTime.getTime() - v.startTime.getTime()) / 60_000));
    leggTilMnd(v.startTime, PYR_TONE[area], min);
  }
  const monthDays = [...mndMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateISO, c]) => ({
      dateISO,
      count: c.count,
      axes: [...c.axes.entries()].map(([ax, min]) => ({ ax, min })),
    }));

  // «I dag» markeres kun når vi faktisk ser på inneværende uke. -1 = ingen.
  const todayDow = offset === 0 ? (now.getDay() + 6) % 7 : -1;

  // ── A · WeekView: header + dag-kolonner med blokker (alle 7 dager) ──
  const weekHead = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      dow: DOW[i],
      date: String(d.getDate()),
      today: i === todayDow,
      sub: i === 0 ? MND_SHORT[d.getMonth()] : "",
    };
  });

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const isToday = i === todayDow;
    const dayEvents: WeekEvent[] = mergedSessions
      .filter((s) => (s.scheduledAt.getDay() + 6) % 7 === i)
      .map((s) => sessionToWeekEvent(s, now));
    return {
      dow: DOW[i],
      date: String(d.getDate()),
      today: isToday,
      sub: i === 0 ? MND_SHORT[d.getMonth()] : "",
      ...(isToday ? { nowLine: { h: now.getHours(), m: now.getMinutes() } } : {}),
      events: dayEvents,
    };
  });

  // ── B · Tidslinje: dag-seksjoner (alle 7 dager) ──────────────────
  const dirBDays: DirBDayData[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const isToday = i === todayDow;
    const daySessions = mergedSessions.filter((s) => (s.scheduledAt.getDay() + 6) % 7 === i);
    const ct = daySessions.length;
    const totMin = daySessions.reduce((a, s) => a + s.durationMin, 0);
    return {
      dow: DOW[i],
      dt: String(d.getDate()),
      mn: MND_UPPER[d.getMonth()],
      ...(isToday ? { tag: "I DAG", isToday: true } : {}),
      summary: { ct: String(ct), dur: fmtDur(totMin) },
      rows: daySessions.map((s) => sessionToDirBRow(s)),
    };
  });

  // ── Kanban: 5 akse-kolonner ─────────────────────────────────────
  const kanbanCols = PYR_REKKEFOLGE.map((area) => {
    const ax = PYR_TONE[area];
    const cards = mergedSessions
      .filter((s) => s.pyramidArea === area)
      .map((s) => {
        const dow = DOW[(s.scheduledAt.getDay() + 6) % 7];
        const metaParts = [fmtDur(s.durationMin)];
        if (s._count.drills > 0) metaParts.push(`${s._count.drills} drills`);
        return {
          day: `${dow} · ${hhmm(s.scheduledAt)}`,
          nm: s.title,
          meta: metaParts.join(" · "),
        };
      });
    return { key: ax, lbl: PYR_SHORT[area], ct: cards.length, cards };
  });

  // ── Timer per akse (denne uka) — statusbar + pie ────────────────
  const weekMinByArea = new Map<PyramidArea, number>();
  for (const s of mergedSessions) {
    weekMinByArea.set(s.pyramidArea, (weekMinByArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  }
  const axisHours = PYR_REKKEFOLGE.map((area) => ({
    ax: PYR_TONE[area],
    lbl: PYR_SHORT[area],
    hours: Math.round(((weekMinByArea.get(area) ?? 0) / 60) * 10) / 10,
  }));

  // ── Pyramide-fordeling (siste 30 d, timer + %) ──────────────────
  const minByArea = new Map<PyramidArea, number>();
  for (const s of last30Sessions) {
    minByArea.set(s.pyramidArea, (minByArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  }
  const total30 = last30Sessions.reduce((a, s) => a + s.durationMin, 0);
  const pctOfTotal30 = (area: PyramidArea): number => {
    const mins = minByArea.get(area) ?? 0;
    return total30 > 0 ? Math.round((mins / total30) * 100) : 0;
  };
  // Pyramide-konvensjon: TURN øverst → FYS nederst.
  const pyramid = [...PYR_REKKEFOLGE].reverse().map((area) => {
    const mins = minByArea.get(area) ?? 0;
    return {
      lbl: PYR_SHORT[area],
      ax: PYR_TONE[area],
      hours: Math.round((mins / 60) * 10) / 10,
      pct: pctOfTotal30(area),
    };
  });
  // CANON-avvik for aktiv periode (siste 30 d mot anbefalt retning) — anbefaling, aldri sperre.
  const pyramidPctByArea: Partial<Record<PyramidArea, number>> = Object.fromEntries(
    PYR_REKKEFOLGE.map((area) => [area, pctOfTotal30(area)]),
  );
  const canonChip = activePeriodBlock
    ? canonDeviationChip(pyramidPctByArea, activePeriodBlock.lPhase)
    : null;

  // ── Turneringer (sidebar) ───────────────────────────────────────
  const tournaments = entries
    .map((e) => {
      const name = e.tournament?.name ?? e.manualName ?? "Turnering";
      const date = e.tournament?.startDate ?? e.manualDate ?? null;
      const loc = e.tournament?.location ?? null;
      const days = date ? Math.ceil((date.getTime() - now.getTime()) / 86_400_000) : null;
      return {
        tn: loc ? `${name} · ${loc}` : name,
        td: days != null ? `${Math.max(0, days)} dg` : "—",
        soon: days != null && days <= 14,
        _sort: days ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a._sort - b._sort)
    .map(({ tn, td, soon }) => ({ tn, td, soon }));

  // ── Mål (sidebar + sesongmål-fane) ─────────────────────────────
  const goalRows = goals.map((g) => {
    const payload =
      g.payload && typeof g.payload === "object" && !Array.isArray(g.payload)
        ? (g.payload as Record<string, unknown>)
        : null;
    const payloadCurrent =
      typeof payload?.currentValue === "number" ? payload.currentValue : null;

    let progressPct: number | null = null;
    if (g.type === "HCP_TARGET" && player?.hcp != null && g.targetValue != null) {
      const current = player.hcp;
      const start = payloadCurrent ?? current;
      const span = start - g.targetValue;
      progressPct =
        Math.abs(span) < 0.001
          ? current === g.targetValue
            ? 100
            : 0
          : Math.max(0, Math.min(100, Math.round(((start - current) / span) * 100)));
    } else if (payloadCurrent != null && g.targetValue != null) {
      progressPct = Math.max(
        0,
        Math.min(100, Math.round((payloadCurrent / g.targetValue) * 100)),
      );
    }

    return {
      gn: g.title,
      gm: g.category === "PROCESS" ? "PROSESSMÅL" : "RESULTATMÅL",
      ax: (g.type === "SG_AREA" ? "spill" : g.type === "HCP_TARGET" ? "tek" : "fys") as Axis,
      targetValue: g.targetValue,
      progressPct,
    };
  });

  // ── Topp-tall ───────────────────────────────────────────────────
  const plannedMin = mergedSessions.reduce((a, s) => a + s.durationMin, 0);
  const summary = {
    weekNumber: isoWeek(weekStart),
    sessionCount: mergedSessions.length,
    plannedHours: Math.round((plannedMin / 60) * 10) / 10,
  };
  const weekAdherencePct = adherencePct(mergedSessions, now);

  // Fokus: coachens eksplisitte periode-fokus vinner; ellers beregnet SG-gap.
  let fokus: WorkbenchFokus | null = null;
  if (activePeriodBlock?.focus) {
    fokus = {
      kilde: "coach",
      label: activePeriodBlock.focus,
      kategori: kategoriFraFritekst(activePeriodBlock.focus),
    };
  } else {
    const gap = await beregnSgGap(userId);
    if (gap) fokus = { kilde: "sg-gap", label: SG_FOKUS_LABEL[gap.kategori], kategori: gap.kategori };
  }

  const templateRows = templateRowsEarly;

  const paletteSeen = new Set<string>();
  const paletteItems: WorkbenchPaletteItem[] = [];
  for (const t of planTemplates) {
    for (const s of t.sessions) {
      const key = `${s.title}-${s.varighetMin}-${s.pyramidArea}`;
      if (paletteSeen.has(key)) continue;
      paletteSeen.add(key);
      paletteItems.push({
        pid: `tpl-${t.id}-${paletteItems.length}`,
        title: s.title,
        dur: s.varighetMin,
        cat: s.pyramidArea,
        skillArea: s.skillArea,
      });
      if (paletteItems.length >= 12) break;
    }
    if (paletteItems.length >= 12) break;
  }

  const groupSlots = groupSlotsEarly;

  const seasonBlocks =
    seasonPlan && seasonPlan.periodBlocks.length > 0
      ? seasonPlan.periodBlocks.map((b) => ({
          id: b.id,
          lPhase: b.lPhase,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          focus: b.focus,
        }))
      : undefined;

  const tournamentCalendar = yearTournaments
    .map((e) => {
      const name = e.tournament?.name ?? e.manualName ?? "Turnering";
      const loc = e.tournament?.location ?? null;
      const title = loc ? `${name} · ${loc}` : name;
      const date = e.tournament?.startDate ?? e.manualDate ?? null;
      if (!date) return null;
      const daysUntil = Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
      const priority = (e.priority === "MAJOR" || e.priority === "LOCAL" ? e.priority : "NORMAL") as
        | "MAJOR"
        | "NORMAL"
        | "LOCAL";
      return { title, startDate: date.toISOString(), daysUntil, priority };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return {
    weekHead,
    weekDays,
    dirBDays,
    kanbanCols,
    axisHours,
    tournaments: tournaments.length > 0 ? tournaments : undefined,
    goals: goalRows.length > 0 ? goalRows : undefined,
    pyramid,
    summary,
    adherencePct: weekAdherencePct,
    fokus,
    volTarget,
    seasonBlocks,
    activePeriodLPhase: activePeriodBlock?.lPhase ?? null,
    canonChip,
    tournamentCalendar: tournamentCalendar.length > 0 ? tournamentCalendar : undefined,
    planTemplates: templateRows.length > 0 ? templateRows : undefined,
    paletteItems: paletteItems.length > 0 ? paletteItems : undefined,
    groupSlots: groupSlots.length > 0 ? groupSlots : undefined,
    usesV2Sessions: v2WeekSessions.length > 0,
    weekOffset: offset,
    weekStartISO,
    monthDays: monthDays.length > 0 ? monthDays : undefined,
  };
}

// ───────── Mappers ─────────

/** TrainingPlanSession → A·WeekView-blokk (posisjonert via h/m + durMin). */
function sessionToWeekEvent(s: WeekSessionRow, now: Date): WeekEvent {
  const start = s.scheduledAt;
  const ax = PYR_TONE[s.pyramidArea];
  const loc = s.environment ? ENV_LABEL[s.environment] ?? null : null;
  const meta: [string, string][] = [["clock", `${hhmm(start)} · ${s.durationMin} m`]];
  if (s._count.drills > 0) meta.push(["layers", `${s._count.drills} drills`]);
  if (loc) meta.push(["map-pin", loc]);
  return {
    id: s.id,
    source: s.source,
    status: s.status,
    h: start.getHours(),
    m: start.getMinutes(),
    durMin: s.durationMin,
    ax,
    eb: PYR_SHORT[s.pyramidArea],
    ttl: s.title,
    meta,
    compliance: oktCompliance(s, now),
  };
}

/** TrainingPlanSession → B·Tidslinje-rad. */
function sessionToDirBRow(s: WeekSessionRow): DirBRowData {
  const ax = PYR_TONE[s.pyramidArea];
  const loc = s.environment ? ENV_LABEL[s.environment] ?? null : null;
  const meta: [string, string][] = [];
  if (s._count.drills > 0) meta.push(["layers", `${s._count.drills} drills`]);
  if (loc) meta.push(["map-pin", loc]);
  return {
    time: hhmm(s.scheduledAt),
    ax,
    axt: PYR_SHORT[s.pyramidArea],
    ttl: s.title,
    ...(meta.length > 0 ? { meta } : {}),
    dur: fmtDur(s.durationMin),
  };
}
