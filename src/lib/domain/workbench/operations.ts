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
