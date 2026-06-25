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
import type { PyramidArea } from "@/generated/prisma/client";
import { PYR_REKKEFOLGE } from "@/lib/pyramide";
import type {
  Axis,
  WeekDay,
  WeekEvent,
  DirBDayData,
  DirBRowData,
} from "@/components/workbench/data";

// ───────── Eksportert data-form ─────────
// Hver del er optional: mangler kilde → komponenten bruker v10-demo.
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
  goals?: { gn: string; gm: string; ax: Axis }[];
  /** Sidebar/dashboard: pyramide-fordeling (timer per akse siste 30 d). */
  pyramid?: { lbl: string; ax: Axis; hours: number; pct: number }[];
  /** Topp-tall: uke-nummer, antall økter, planlagte timer. */
  summary?: { weekNumber: number; sessionCount: number; plannedHours: number };
  /** Ukevolum-mål fra spillerens aktive PeriodBlock (min/max minutter). Null-felt = ikke satt. */
  volTarget?: { min: number | null; max: number | null };
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
  _count: { select: { drills: true } },
} as const;

type WeekSessionRow = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  title: string;
  pyramidArea: PyramidArea;
  environment: "RANGE" | "BANE" | "STUDIO" | "HJEM" | "SIMULATOR" | "GYM" | null;
  _count: { drills: number };
};

/**
 * Kjernen: gitt en bruker-id, bygg `WorkbenchData` fra ekte Prisma-data.
 * Returnerer `null` hvis brukeren ikke finnes (coach-rute → notFound()).
 */
export async function loadWorkbenchData(userId: string): Promise<WorkbenchData | null> {
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) return null;

  const now = new Date();
  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  const [weekSessions, last30Sessions, goals, entries, activePeriod] = await Promise.all([
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
      select: { id: true, title: true, type: true, category: true },
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
    // Aktiv periode-blokk (dagens dato innenfor start/slutt) → ukevolum-mål.
    prisma.periodBlock.findFirst({
      where: { seasonPlan: { userId }, startDate: { lte: now }, endDate: { gte: now } },
      select: { weeklyVolMin: true, weeklyVolMax: true },
    }),
  ]);

  const volTarget =
    activePeriod && (activePeriod.weeklyVolMin != null || activePeriod.weeklyVolMax != null)
      ? { min: activePeriod.weeklyVolMin, max: activePeriod.weeklyVolMax }
      : undefined;

  // Tom DB → eksplisitt tom tilstand (ingen demo-økter i produksjon).
  if (
    weekSessions.length === 0 &&
    last30Sessions.length === 0 &&
    goals.length === 0 &&
    entries.length === 0
  ) {
    return { summary: { weekNumber: isoWeek(now), sessionCount: 0, plannedHours: 0 } };
  }

  const sessions = weekSessions as WeekSessionRow[];
  const todayDow = (now.getDay() + 6) % 7;

  // ── A · WeekView: header + dag-kolonner med blokker ──────────────
  const weekHead = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      dow: DOW[i],
      date: String(d.getDate()),
      today: i === todayDow,
      sub: i === 0 ? MND_SHORT[d.getMonth()] : "",
    };
  });

  const weekDays: WeekDay[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const isToday = i === todayDow;
    const dayEvents: WeekEvent[] = sessions
      .filter((s) => (s.scheduledAt.getDay() + 6) % 7 === i)
      .map((s) => sessionToWeekEvent(s));
    return {
      dow: DOW[i],
      date: String(d.getDate()),
      today: isToday,
      sub: i === 0 ? MND_SHORT[d.getMonth()] : "",
      ...(isToday ? { nowLine: { h: now.getHours(), m: now.getMinutes() } } : {}),
      events: dayEvents,
    };
  });

  // ── B · Tidslinje: 5 dag-seksjoner ──────────────────────────────
  const dirBDays: DirBDayData[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const isToday = i === todayDow;
    const daySessions = sessions.filter((s) => (s.scheduledAt.getDay() + 6) % 7 === i);
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
    const cards = sessions
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
  for (const s of sessions) {
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
  // Pyramide-konvensjon: TURN øverst → FYS nederst.
  const pyramid = [...PYR_REKKEFOLGE].reverse().map((area) => {
    const mins = minByArea.get(area) ?? 0;
    return {
      lbl: PYR_SHORT[area],
      ax: PYR_TONE[area],
      hours: Math.round((mins / 60) * 10) / 10,
      pct: total30 > 0 ? Math.round((mins / total30) * 100) : 0,
    };
  });

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

  // ── Mål (sidebar) ───────────────────────────────────────────────
  const goalRows = goals.map((g) => ({
    gn: g.title,
    gm: g.category === "PROCESS" ? "PROSESSMÅL" : "RESULTATMÅL",
    ax: (g.type === "SG_AREA" ? "spill" : g.type === "HCP_TARGET" ? "tek" : "fys") as Axis,
  }));

  // ── Topp-tall ───────────────────────────────────────────────────
  const plannedMin = sessions.reduce((a, s) => a + s.durationMin, 0);
  const summary = {
    weekNumber: isoWeek(now),
    sessionCount: sessions.length,
    plannedHours: Math.round((plannedMin / 60) * 10) / 10,
  };

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
    volTarget,
  };
}

// ───────── Mappers ─────────

/** TrainingPlanSession → A·WeekView-blokk (posisjonert via h/m + durMin). */
function sessionToWeekEvent(s: WeekSessionRow): WeekEvent {
  const start = s.scheduledAt;
  const ax = PYR_TONE[s.pyramidArea];
  const loc = s.environment ? ENV_LABEL[s.environment] ?? null : null;
  const meta: [string, string][] = [["clock", `${hhmm(start)} · ${s.durationMin} m`]];
  if (s._count.drills > 0) meta.push(["layers", `${s._count.drills} drills`]);
  if (loc) meta.push(["map-pin", loc]);
  return {
    id: s.id,
    h: start.getHours(),
    m: start.getMinutes(),
    durMin: s.durationMin,
    ax,
    eb: PYR_SHORT[s.pyramidArea],
    ttl: s.title,
    meta,
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
