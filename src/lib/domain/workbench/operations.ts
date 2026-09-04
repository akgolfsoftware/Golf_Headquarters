/**
 * Pure domain operations for Workbench.
 * No I/O, no React, no Prisma. Easy to unit-test.
 * All mutations return new state (immutable).
 */

import type {
  WorkbenchSession,
  CreateSessionCommand,
  MoveSessionCommand,
  PublishSessionCommand,
  AddDrillCommand,
  ReorderDrillsCommand,
  Drill,
  WeekBudget,
  PyramidArea,
  DayColumn,
  WeekViewModel,
  MonthViewModel,
  MonthWeekRow,
  MonthDayCell,
  YearViewModel,
  YearMonthRow,
  YearPeriodBand,
  PeriodType,
  WorkbenchMode,
  RecurrencePolicy,
  SeriesContentPatch,
  ApprovalStatus,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

export function snapToGrid(minute: number, grid = 30): number {
  return Math.round(minute / grid) * grid;
}

export function clampMinute(m: number): number {
  return Math.max(0, Math.min(23 * 60 + 30, m)); // 00:00 – 23:30
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00Z");
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function generateId(prefix = "ws"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Create ─────────────────────────────────────────────────────────────────

export function createSession(
  cmd: CreateSessionCommand,
  now = new Date().toISOString()
): WorkbenchSession {
  const start = clampMinute(snapToGrid(cmd.startMinute));
  const duration = Math.max(15, snapToGrid(cmd.durationMinutes || 60));

  const drills: Drill[] = (cmd.drills ?? []).map((d, i) => ({
    ...d,
    id: generateId("dr"),
    order: i,
  }));

  return {
    id: generateId("ws"),
    playerId: cmd.playerId,
    coachId: cmd.coachId,
    date: cmd.date,
    startMinute: start,
    durationMinutes: duration,
    title: cmd.title.trim() || "Økt",
    pyramid: cmd.pyramid,
    status: "DRAFT",
    blockType: cmd.blockType ?? "OEKT",
    environment: cmd.environment,
    notes: cmd.notes,
    drills,
    groupId: cmd.groupId,
    origin:
      cmd.origin ??
      (cmd.groupId ? "GROUP" : cmd.createdBy === "COACH" ? "COACH" : "PLAYER"),
    createdAt: now,
    updatedAt: now,
    createdBy: cmd.createdBy,
  };
}

// ─── Serie ("gjenta") ───────────────────────────────────────────────────────

/**
 * Oppretter N ukentlige forekomster av samme økt, én uke fra hverandre,
 * som deler `seriesId`. `weeks = 1` gir nøyaktig samme resultat som
 * `createSession` — ingen serie, ingen `seriesId`.
 */
export function createSessionSeries(
  cmd: CreateSessionCommand,
  weeks: number,
  now = new Date().toISOString(),
): WorkbenchSession[] {
  if (weeks <= 1) return [createSession(cmd, now)];

  const seriesId = generateId("serie");
  return Array.from({ length: weeks }, (_, i) => {
    const forekomst = createSession({ ...cmd, date: addDays(cmd.date, i * 7) }, now);
    return { ...forekomst, seriesId, seriesIndex: i };
  });
}

/**
 * Hvilke forekomster i serien en endre-policy treffer. Rent utvalg — ingen
 * mutasjon. Datofelt er ALDRI en del av patchen som brukes videre; hver
 * forekomst beholder egen dag/tid uansett policy.
 */
export function sessionsMatchingPolicy(
  seriesSessions: WorkbenchSession[],
  currentSessionId: string,
  policy: RecurrencePolicy,
): WorkbenchSession[] {
  const gjeldende = seriesSessions.find((s) => s.id === currentSessionId);
  if (!gjeldende) return [];
  if (policy === "DENNE") return [gjeldende];
  if (policy === "HELE_SERIEN") return seriesSessions;
  const gjeldendeIndex = gjeldende.seriesIndex ?? 0;
  return seriesSessions.filter((s) => (s.seriesIndex ?? 0) >= gjeldendeIndex);
}

/** Slår sammen en innholds-patch inn i én økt. Aldri dato/tid. */
export function applySeriesPatch(
  session: WorkbenchSession,
  patch: SeriesContentPatch,
  now = new Date().toISOString(),
): WorkbenchSession {
  return { ...session, ...patch, updatedAt: now };
}

// ─── Move / Resize ──────────────────────────────────────────────────────────

export function moveSession(
  session: WorkbenchSession,
  cmd: MoveSessionCommand,
  now = new Date().toISOString()
): WorkbenchSession {
  const start = clampMinute(snapToGrid(cmd.newStartMinute));
  const duration =
    cmd.newDurationMinutes !== undefined
      ? Math.max(15, snapToGrid(cmd.newDurationMinutes))
      : session.durationMinutes;

  return {
    ...session,
    date: cmd.newDate,
    startMinute: start,
    durationMinutes: duration,
    updatedAt: now,
  };
}

// ─── Publish ────────────────────────────────────────────────────────────────

export function publishSession(
  session: WorkbenchSession,
  cmd: PublishSessionCommand,
  now = new Date().toISOString()
): WorkbenchSession {
  if (session.status === "PUBLISHED") return session;
  if (session.status === "CANCELLED") {
    throw new Error("Kan ikke publisere en avlyst økt");
  }

  return {
    ...session,
    status: "PUBLISHED",
    publishedAt: now,
    publishedBy: cmd.publishedBy,
    updatedAt: now,
  };
}

export function unpublishSession(
  session: WorkbenchSession,
  now = new Date().toISOString()
): WorkbenchSession {
  if (session.status !== "PUBLISHED") return session;
  return {
    ...session,
    status: "DRAFT",
    publishedAt: undefined,
    publishedBy: undefined,
    updatedAt: now,
  };
}

// ─── Drills ─────────────────────────────────────────────────────────────────

export function addDrill(
  session: WorkbenchSession,
  cmd: AddDrillCommand,
  now = new Date().toISOString()
): WorkbenchSession {
  const drill: Drill = {
    ...cmd.drill,
    id: generateId("dr"),
    order: cmd.atIndex ?? session.drills.length,
  };

  const drills = [...session.drills];
  if (cmd.atIndex !== undefined && cmd.atIndex < drills.length) {
    drills.splice(cmd.atIndex, 0, drill);
  } else {
    drills.push(drill);
  }

  // re-index
  const reindexed = drills.map((d, i) => ({ ...d, order: i }));

  return {
    ...session,
    drills: reindexed,
    // optional: grow duration if drills exceed current length
    durationMinutes: Math.max(
      session.durationMinutes,
      reindexed.reduce((sum, d) => sum + d.durationMinutes, 0)
    ),
    updatedAt: now,
  };
}

export function reorderDrills(
  session: WorkbenchSession,
  cmd: ReorderDrillsCommand,
  now = new Date().toISOString()
): WorkbenchSession {
  const map = new Map(session.drills.map((d) => [d.id, d]));
  const ordered = cmd.orderedDrillIds
    .map((id) => map.get(id))
    .filter(Boolean) as Drill[];

  // append any missing
  for (const d of session.drills) {
    if (!cmd.orderedDrillIds.includes(d.id)) ordered.push(d);
  }

  return {
    ...session,
    drills: ordered.map((d, i) => ({ ...d, order: i })),
    updatedAt: now,
  };
}

export function removeDrill(
  session: WorkbenchSession,
  drillId: string,
  now = new Date().toISOString()
): WorkbenchSession {
  const drills = session.drills
    .filter((d) => d.id !== drillId)
    .map((d, i) => ({ ...d, order: i }));
  return { ...session, drills, updatedAt: now };
}

// ─── Week assembly & budget ─────────────────────────────────────────────────

export function computeBudget(sessions: WorkbenchSession[]): WeekBudget {
  const byPyramid: Record<PyramidArea, number> = {
    FYS: 0,
    TEK: 0,
    SLAG: 0,
    SPILL: 0,
    TURN: 0,
  };

  let planned = 0;
  for (const s of sessions) {
    if (s.status === "CANCELLED" || s.status === "SKIPPED") continue;
    planned += s.durationMinutes;
    byPyramid[s.pyramid] = (byPyramid[s.pyramid] ?? 0) + s.durationMinutes;
  }

  return {
    plannedMinutes: planned,
    targetMinutes: 0, // filled by caller from player profile
    byPyramid,
  };
}

export function buildWeekViewModel(
  weekStart: string,
  sessions: WorkbenchSession[],
  lockedBlocks: DayColumn["lockedBlocks"][] = [],
  mode: WorkbenchMode,
  targetMinutes = 0
): WeekViewModel {
  const days: DayColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const daySessions = sessions
      .filter((s) => s.date === date)
      .sort((a, b) => a.startMinute - b.startMinute);

    days.push({
      date,
      weekday: i + 1,
      sessions: daySessions,
      lockedBlocks: lockedBlocks[i] ?? [],
    });
  }

  const budget = computeBudget(sessions);
  budget.targetMinutes = targetMinutes;

  return { weekStart, days, budget, mode };
}

const PYRAMID_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const MAX_MONTH_LINES = 3;

export function monthStartOf(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`;
}

export function lastDayOfMonth(monthStart: string): string {
  const [y, m] = monthStart.split("-").map(Number);
  const neste = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return addDays(neste, -1);
}

export function addMonths(monthStart: string, delta: number): string {
  const [y, m] = monthStart.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}-01`;
}

/** ISO-uke for en YYYY-MM-DD (UTC-dato, samme konvensjon som mondayOf). */
export function isoWeekNumber(isoDate: string): number {
  const d = new Date(isoDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
}

export function dominantPyramid(sessions: WorkbenchSession[]): PyramidArea | null {
  const budget = computeBudget(sessions);
  let best: PyramidArea | null = null;
  let bestMin = 0;
  for (const p of PYRAMID_ORDER) {
    const min = budget.byPyramid[p] ?? 0;
    if (min > bestMin) {
      best = p;
      bestMin = min;
    }
  }
  return best;
}

function aktiveOkter(sessions: WorkbenchSession[]): WorkbenchSession[] {
  return sessions.filter((s) => s.status !== "CANCELLED" && s.status !== "SKIPPED");
}

export function buildMonthViewModel(
  monthStart: string,
  sessions: WorkbenchSession[],
  mode: WorkbenchMode,
  targetMinutes = 0,
  monthLabel: string,
): MonthViewModel {
  const last = lastDayOfMonth(monthStart);
  const gridStart = mondayOf(monthStart);
  const gridEndMonday = mondayOf(last);
  const byDate = new Map<string, WorkbenchSession[]>();
  for (const s of sessions) {
    const list = byDate.get(s.date) ?? [];
    list.push(s);
    byDate.set(s.date, list);
  }

  const weeks: MonthWeekRow[] = [];
  const weekSummaries: MonthViewModel["weekSummaries"] = [];
  for (let cursor = gridStart; cursor <= gridEndMonday; cursor = addDays(cursor, 7)) {
    const days: MonthDayCell[] = [];
    let weekMinutes = 0;
    let weekCount = 0;
    for (let i = 0; i < 7; i++) {
      const date = addDays(cursor, i);
      const dags = (byDate.get(date) ?? [])
        .slice()
        .sort((a, b) => a.startMinute - b.startMinute);
      const aktive = aktiveOkter(dags);
      weekMinutes += aktive.reduce((n, s) => n + s.durationMinutes, 0);
      weekCount += aktive.length;
      const shown = aktive.slice(0, MAX_MONTH_LINES);
      days.push({
        date,
        dayOfMonth: Number(date.slice(8, 10)),
        inMonth: date >= monthStart && date <= last,
        lines: shown.map((s) => ({
          title: s.title,
          durationMinutes: s.durationMinutes,
          hairline: s.blockType === "TURNERING" || s.blockType === "TEST",
        })),
        restCount: Math.max(0, aktive.length - MAX_MONTH_LINES),
      });
    }
    weeks.push({ weekStart: cursor, weekNumber: isoWeekNumber(cursor), days });
    weekSummaries.push({
      weekStart: cursor,
      weekNumber: isoWeekNumber(cursor),
      sessionCount: weekCount,
      minutes: weekMinutes,
    });
  }

  const inMonth = aktiveOkter(sessions).filter(
    (s) => s.date >= monthStart && s.date <= last,
  );
  const budget = computeBudget(inMonth);
  budget.targetMinutes = targetMinutes;

  return {
    monthStart,
    label: monthLabel,
    weeks,
    budget,
    weekSummaries,
    empty: inMonth.length === 0,
    mode,
  };
}

/** Rå dager fra 1970-01-01 (UTC) for en YYYY-MM-DD-streng — kun for avstandsmatte, aldri vist. */
function dagNummer(isoDato: string): number {
  const [y, m, d] = isoDato.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export interface YearPeriodInput {
  id: string;
  type: PeriodType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  focus: string | null;
}

export interface YearEventInput {
  navn: string;
  dato: string; // YYYY-MM-DD
}

const TOM_BALANSE: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };

export function buildYearViewModel(
  year: number,
  sessions: WorkbenchSession[],
  mode: WorkbenchMode,
  targetMinutes = 0,
  periodInput: YearPeriodInput[] = [],
  tournaments: YearEventInput[] = [],
  tests: YearEventInput[] = [],
  idagIso?: string,
): YearViewModel {
  const events = [...tournaments, ...tests].sort((a, b) => (a.dato < b.dato ? -1 : 1));
  const eventsByMonth = new Map<number, string[]>();
  for (const e of events) {
    const m = Number(e.dato.slice(5, 7));
    if (!eventsByMonth.has(m)) eventsByMonth.set(m, []);
    eventsByMonth.get(m)!.push(`${e.navn} ${e.dato.slice(8, 10)}.${e.dato.slice(5, 7)}`);
  }

  const months: YearMonthRow[] = [];
  let maxMin = 1;
  const perMonth: { start: string; list: WorkbenchSession[] }[] = [];
  for (let m = 1; m <= 12; m++) {
    const start = `${year}-${String(m).padStart(2, "0")}-01`;
    const last = lastDayOfMonth(start);
    const list = aktiveOkter(sessions).filter((s) => s.date >= start && s.date <= last);
    const minutes = list.reduce((n, s) => n + s.durationMinutes, 0);
    if (minutes > maxMin) maxMin = minutes;
    perMonth.push({ start, list });
  }
  for (let i = 0; i < 12; i++) {
    const { start, list } = perMonth[i];
    const minutes = list.reduce((n, s) => n + s.durationMinutes, 0);
    months.push({
      monthStart: start,
      monthIndex: i + 1,
      minutes,
      sessionCount: list.length,
      dominantPyramid: dominantPyramid(list),
      volumePct: Math.round((minutes / maxMin) * 100),
      eventLabels: eventsByMonth.get(i + 1) ?? [],
    });
  }
  const budget = computeBudget(aktiveOkter(sessions));
  budget.targetMinutes = targetMinutes;

  const yearStartDag = dagNummer(`${year}-01-01`);
  const yearDager = dagNummer(`${year + 1}-01-01`) - yearStartDag;
  const idagDag = idagIso ? dagNummer(idagIso) : dagNummer(`${year}-01-01`) - 1; // aldri aktiv uten idag

  const periods: YearPeriodBand[] = [...periodInput]
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
    .map((p) => {
      const startDag = dagNummer(p.startDate);
      const endDag = dagNummer(p.endDate);
      const widthPct = Math.max(0, ((endDag - startDag + 1) / yearDager) * 100);
      const balanseTimer = { ...TOM_BALANSE };
      const turneringer: { navn: string; dato: string }[] = [];
      for (const s of aktiveOkter(sessions)) {
        if (s.date >= p.startDate && s.date <= p.endDate) {
          balanseTimer[s.pyramid] += s.durationMinutes / 60;
        }
      }
      for (const e of tournaments) {
        if (e.dato >= p.startDate && e.dato <= p.endDate) turneringer.push(e);
      }
      return {
        id: p.id,
        type: p.type,
        startDate: p.startDate,
        endDate: p.endDate,
        focus: p.focus,
        widthPct,
        aktiv: startDag <= idagDag && idagDag <= endDag,
        balanseTimer,
        turneringer: turneringer.sort((a, b) => (a.dato < b.dato ? -1 : 1)),
      };
    });

  return { year, months, periods, budget, mode };
}

// ─── Validation (soft — never blocks) ───────────────────────────────────────

export interface ValidationNote {
  level: "info" | "warn";
  message: string;
  sessionId?: string;
}

export function validateWeek(sessions: WorkbenchSession[]): ValidationNote[] {
  const notes: ValidationNote[] = [];

  // overlap detection (same player, same day)
  const byDay = new Map<string, WorkbenchSession[]>();
  for (const s of sessions) {
    if (s.status === "CANCELLED") continue;
    const list = byDay.get(s.date) ?? [];
    list.push(s);
    byDay.set(s.date, list);
  }

  for (const [date, list] of byDay) {
    const sorted = [...list].sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.startMinute + prev.durationMinutes > curr.startMinute) {
        notes.push({
          level: "warn",
          message: `Overlapp ${date}: «${prev.title}» og «${curr.title}»`,
          sessionId: curr.id,
        });
      }
    }
  }

  return notes;
}

// ─── Publish batch (coach publishes whole week or selection) ────────────────

export function publishMany(
  sessions: WorkbenchSession[],
  ids: string[],
  publishedBy: string,
  now = new Date().toISOString()
): WorkbenchSession[] {
  const idSet = new Set(ids);
  return sessions.map((s) =>
    idSet.has(s.id)
      ? publishSession(s, { sessionId: s.id, publishedBy }, now)
      : s
  );
}

// ─── Godkjenning (Loop 3T / B6) ─────────────────────────────────────────────

/**
 * Spillerens svar på en økt med `needsPlayerApproval` (forslag fra coach
 * eller gruppe — ACCESS-AND-GROUPS.md §4/§5). ACCEPTED beholder økten som
 * den er, kun flaggene ryddes. REJECTED skjuler økten for spilleren
 * (`hiddenByPlayer`, samme mekanisme som «Ikke delta», WB-10) — den slettes
 * ALDRI, og innholdet/tid/eierskap er urørt.
 */
export function resolvePlayerApproval(
  session: WorkbenchSession,
  decision: "ACCEPTED" | "REJECTED",
  now = new Date().toISOString()
): WorkbenchSession {
  const approvalStatus: ApprovalStatus = decision;
  return {
    ...session,
    approvalStatus,
    needsPlayerApproval: false,
    hiddenByPlayer: decision === "REJECTED" ? true : session.hiddenByPlayer,
    updatedAt: now,
  };
}
