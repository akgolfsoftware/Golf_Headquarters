"use server";

/**
 * Workbench-kjernen — server actions (natt-plan 25.08.2026, Loop 1).
 *
 * Persistens for den nye Workbench-modellen. Domenet i
 * `src/lib/domain/workbench/` er rent; alle sideeffekter bor her.
 *
 * Tilgang: spilleren selv, eller en coach/admin som faktisk har tilgang til
 * spilleren (`harCoachTilgangTilSpiller`) — rolle-sjekk alene er ikke nok.
 *
 * Personvern: logg IDer, aldri navn.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { loadStallen } from "@/lib/admin/stallen-data";
import {
  addDays,
  addDrill as addDrillPure,
  applySeriesPatch,
  buildMonthViewModel,
  buildPeriodViewModel,
  buildWeekViewModel,
  buildYearViewModel,
  createSession as createSessionPure,
  lastDayOfMonth,
  mondayOf,
  monthStartOf,
  createSessionSeries as createSessionSeriesPure,
  moveSession as moveSessionPure,
  publishSession as publishSessionPure,
  reorderDrills as reorderDrillsPure,
  resolvePlayerApproval as resolvePlayerApprovalPure,
  sessionsMatchingPolicy,
  unpublishSession as unpublishSessionPure,
} from "@/lib/domain/workbench/operations";
import { buildStallDagViewModel, type StallDagViewModel } from "@/lib/domain/workbench/stall-dag";
import type {
  AKFormel,
  Drill,
  Motorikk,
  RecurrencePolicy,
  MonthViewModel,
  PeriodViewModel,
  SourceItem,
  WeekViewModel,
  WorkbenchMode,
  WorkbenchSession,
  YearViewModel,
} from "@/lib/domain/workbench/types";
import { UI } from "@/lib/domain/workbench/labels";
import { weekLockedBlocks } from "@/lib/workbench/locked-blocks";
import {
  initialWorkbenchLiveSnapshot,
  parseWorkbenchLiveSnapshot,
  type WorkbenchLiveData,
} from "@/lib/workbench/live";
import { osloInstant } from "@/lib/jarvis/dagen";
import {
  osloDatoOgMinutt,
  type MinKalenderData,
  type MinKalenderItem,
} from "@/lib/workbench/min-calendar";
import {
  AkFormelSchema,
  BlockTypeSchema,
  DeleteSeriesSessionInputSchema,
  EnvironmentSchema,
  IsoDateSchema,
  MoveSessionInputSchema,
  PyramidAreaSchema,
  ReorderDrillsInputSchema,
  RepeatWeeksSchema,
  ResolvePlayerApprovalInputSchema,
  UpdateSeriesSessionInputSchema,
} from "@/lib/domain/workbench/schemas";
import {
  SPILLER_SYNLIGE_STATUSER,
  mapSession,
  tilDatoKolonne,
  fraDatoKolonne,
  type WbRow,
} from "@/lib/workbench/wb-map";
import {
  exerciseToSourceItem,
  omraadeKodeTilTrainingArea,
  parseSourceId,
  previousWeekToSourceItem,
  tekniskOppgaveToSourceItem,
  templateToSourceItem,
} from "@/lib/workbench/sources-map";
import { hentTekniskPanel } from "@/lib/workbench/teknisk-plan-panel";

// ─── Resultattype ───────────────────────────────────────────────────────────

export type WbResultat<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * AKFormel → Prisma JSON. Eksplisitt felt for felt: et cast ville sneket
 * ugyldige verdier forbi typesjekken (CLAUDE.md invariant 6).
 */
function akFormelTilJson(f: AKFormel): Prisma.InputJsonObject {
  return {
    pyramid: f.pyramid,
    area: f.area,
    label: f.label,
    ...(f.motorikk ? { motorikk: f.motorikk } : {}),
    ...(f.belastning ? { belastning: f.belastning } : {}),
    ...(f.press ? { press: f.press } : {}),
  };
}

const INGEN_TILGANG = "Du har ikke tilgang til denne spilleren.";
const FINNES_IKKE = "Fant ikke økten.";

/**
 * Ruter som leser Workbench-tabellene. Kalles etter hver skriving slik at
 * coach-uka og spillerens dag ikke serverer en foreldet cache.
 */
function revalider(playerId: string): void {
  revalidatePath(`/admin/workbench/${playerId}`);
  revalidatePath("/portal");
}

// ─── Tilgang ────────────────────────────────────────────────────────────────

type Viewer = { id: string; role: string };

async function kreverTilgangTilSpiller(playerId: string): Promise<Viewer | null> {
  const user = await requirePortalUser();
  if (user.id === playerId) return { id: user.id, role: user.role };
  if (user.role !== "COACH" && user.role !== "ADMIN") return null;
  const harTilgang = await harCoachTilgangTilSpiller(
    { id: user.id, role: user.role },
    playerId,
  );
  return harTilgang ? { id: user.id, role: user.role } : null;
}

/** Henter økten og verifiserer at innloggede har lov til å røre den. */
async function hentMedTilgang(
  sessionId: string,
  db: Pick<Prisma.TransactionClient, "workbenchSession"> = prisma,
): Promise<{ row: WbRow; viewer: Viewer } | { feil: string }> {
  const row = await db.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row) return { feil: FINNES_IKKE };
  const viewer = await kreverTilgangTilSpiller(row.playerId);
  if (!viewer) return { feil: INGEN_TILGANG };
  return { row, viewer };
}

// ─── Skjemaer ───────────────────────────────────────────────────────────────

const DrillInputSchema = z.object({
  title: z.string().min(1, "Øvelsen må ha et navn"),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(1).max(600),
  akFormel: AkFormelSchema,
  techniqueFocus: z.string().optional(),
  sourceId: z.string().optional(),
});

const CreateSessionSchema = z.object({
  playerId: z.string().min(1),
  date: IsoDateSchema,
  startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720),
  title: z.string().min(1, "Økten må ha en tittel"),
  pyramid: PyramidAreaSchema,
  blockType: BlockTypeSchema.optional(),
  environment: EnvironmentSchema.optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  drills: z.array(DrillInputSchema).optional(),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

const CreateSessionSeriesSchema = CreateSessionSchema.extend({
  repeatWeeks: RepeatWeeksSchema,
});

export type CreateSessionSeriesInput = z.infer<typeof CreateSessionSeriesSchema>;

const CreateFromSourceSchema = z.object({
  playerId: z.string().min(1),
  sourceId: z.string().min(1),
  date: IsoDateSchema,
  startMinute: z.number().int().min(0).max(1439),
});

const AddDrillFromSourceSchema = z.object({
  sessionId: z.string().min(1),
  sourceId: z.string().min(1),
});

const SaveWorkbenchLiveSchema = z.object({
  sessionId: z.string().min(1),
  totalSec: z.number().int().min(0).max(604800),
  drills: z.array(z.object({
    drillId: z.string().min(1),
    reps: z.number().int().min(0).max(5000),
    elapsedSec: z.number().int().min(0).max(86400),
    status: z.enum(["done", "active", "queued"]),
  })).max(100),
  seriesTargets: z.record(z.string(), z.number().int().min(1).max(12)),
});

const StartNextWorkbenchLiveSchema = z.object({
  currentSessionId: z.string().min(1).optional(),
  nextSessionId: z.string().min(1),
});

/** Prisma `create`-data delt av `createSession`/`createSessionSeries`/`createSessionFromSource`. */
function sessionOpprettelseData(s: WorkbenchSession) {
  return {
    playerId: s.playerId,
    coachId: s.coachId,
    groupId: s.groupId ?? null,
    date: tilDatoKolonne(s.date),
    startMinute: s.startMinute,
    durationMinutes: s.durationMinutes,
    title: s.title,
    pyramid: s.pyramid,
    status: s.status,
    blockType: s.blockType,
    environment: s.environment ?? null,
    notes: s.notes ?? null,
    origin: s.origin,
    createdBy: s.createdBy,
    seriesId: s.seriesId ?? null,
    seriesIndex: s.seriesIndex ?? null,
    drills: {
      create: s.drills.map((d) => ({
        title: d.title,
        description: d.description ?? null,
        durationMinutes: d.durationMinutes,
        akFormel: akFormelTilJson(d.akFormel),
        techniqueFocus: d.techniqueFocus ?? null,
        sourceId: d.sourceId ?? null,
        sortOrder: d.order,
      })),
    },
  };
}

// ─── Lesing ─────────────────────────────────────────────────────────────────

/**
 * Hele uka for én spiller — coach-siden. Inneholder DRAFT.
 * Tar med spillerens egne opptattblokker og skolerute etter tilgangsvakten.
 */
export async function loadWeek(params: {
  weekStart: string;
  mode: WorkbenchMode;
  playerId: string;
  targetMinutes?: number;
}): Promise<WbResultat<WeekViewModel>> {
  const weekStart = IsoDateSchema.safeParse(params.weekStart);
  if (!weekStart.success) return { ok: false, error: "Ugyldig ukestart." };

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const fra = tilDatoKolonne(weekStart.data);
  const til = new Date(fra);
  til.setUTCDate(til.getUTCDate() + 6);

  // Spilleren selv ser aldri skjulte («ikke delta»/avvist, WB-10) økter i
  // listevisninger — agency (coach/admin) ser dem fortsatt, uendret,
  // markert via `hiddenByPlayer` i UI (WB-10c).
  const erSpillerenSelv = viewer.id === params.playerId;

  const rows = await prisma.workbenchSession.findMany({
    where: {
      playerId: params.playerId,
      date: { gte: fra, lte: til },
      ...(erSpillerenSelv ? { hiddenByPlayer: false } : {}),
    },
    include: { drills: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });

  const spiller = await prisma.user.findUnique({ where: { id: params.playerId }, select: { schoolYear: true } });
  const nesteUke = new Date(fra);
  nesteUke.setUTCDate(nesteUke.getUTCDate() + 7);
  const [busy, school] = await Promise.all([
    prisma.playerBusyBlock.findMany({
      where: { userId: params.playerId, startAt: { lt: nesteUke } },
      select: { id: true, title: true, startAt: true, endAt: true, recurring: true, isPrivate: true, kind: true },
    }),
    spiller?.schoolYear ? prisma.schoolScheduleEntry.findMany({
      where: { date: { gte: fra, lt: nesteUke }, OR: [{ classYear: spiller.schoolYear }, { classYear: null }] },
      select: { id: true, title: true, date: true, category: true },
    }) : Promise.resolve([]),
  ]);

  const vm = buildWeekViewModel(
    weekStart.data,
    rows.map(mapSession),
    weekLockedBlocks(weekStart.data, busy, school),
    params.mode,
    params.targetMinutes ?? 0,
  );
  return { ok: true, data: vm };
}

export type StallFollowupData = {
  sessions: WorkbenchSession[];
  pendingPlanActionIds: string[];
  from: string;
  to: string;
};

/**
 * Stallens oppfølgingsliste for valgt spiller. Vinduet er to uker fra valgt
 * mandag, slik at coachen kan vurdere utkast, delte og gjennomførte økter i én
 * kort liste. Tilgangsvakten kjøres før første databasespørring.
 */
export async function loadStallFollowup(params: {
  weekStart: string;
  playerId: string;
}): Promise<WbResultat<StallFollowupData>> {
  const parsed = IsoDateSchema.safeParse(params.weekStart);
  if (!parsed.success) return { ok: false, error: "Ugyldig ukestart." };

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const from = mondayOf(parsed.data);
  const to = addDays(from, 13);
  const sessions = await lastOkterIVindu(params.playerId, from, to, viewer.id);
  const actionIds = sessions
    .filter((session) => session.isAgentProposal && session.planActionId)
    .map((session) => session.planActionId as string);
  const pending = actionIds.length > 0
    ? await prisma.planAction.findMany({
        where: { id: { in: actionIds }, status: "PENDING", userId: params.playerId },
        select: { id: true },
      })
    : [];

  return {
    ok: true,
    data: {
      sessions,
      pendingPlanActionIds: pending.map((action) => action.id),
      from,
      to,
    },
  };
}

/** Live-flaten viser én pågående økt og nærmeste publiserte økt i valgt toukersvindu. */
export async function loadWorkbenchLive(params: {
  weekStart: string;
  playerId: string;
}): Promise<WbResultat<WorkbenchLiveData>> {
  const parsed = IsoDateSchema.safeParse(params.weekStart);
  if (!parsed.success) return { ok: false, error: "Ugyldig ukestart." };

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const from = mondayOf(parsed.data);
  const to = addDays(from, 13);
  const rows = await prisma.workbenchSession.findMany({
    where: {
      playerId: params.playerId,
      date: { gte: tilDatoKolonne(from), lte: tilDatoKolonne(to) },
      status: { in: ["IN_PROGRESS", "PUBLISHED"] },
      hiddenByPlayer: false,
      needsPlayerApproval: false,
    },
    include: { drills: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });
  const eligible = rows.filter((row) => row.approvalStatus !== "REJECTED");
  const currentRow = eligible.find((row) => row.status === "IN_PROGRESS") ?? null;
  const published = eligible.filter((row) => row.status === "PUBLISHED");
  const currentKey = currentRow ? `${fraDatoKolonne(currentRow.date)}:${String(currentRow.startMinute).padStart(4, "0")}` : "";
  const nextRow = currentRow
    ? published.find((row) => `${fraDatoKolonne(row.date)}:${String(row.startMinute).padStart(4, "0")}` > currentKey) ?? published[0] ?? null
    : published[0] ?? null;
  const current = currentRow ? mapSession(currentRow) : null;

  return {
    ok: true,
    data: {
      current,
      next: nextRow ? mapSession(nextRow) : null,
      snapshot: currentRow && current
        ? parseWorkbenchLiveSnapshot(currentRow.liveSnapshot, current.drills.map((drill) => drill.id), current.updatedAt)
        : null,
      from,
      to,
    },
  };
}

/** Coachens egen uke: egne Workbench-økter og bookinger, uten skrivehandlinger. */
export async function loadMinCalendar(params: {
  weekStart: string;
  playerId: string;
}): Promise<WbResultat<MinKalenderData>> {
  const parsed = IsoDateSchema.safeParse(params.weekStart);
  if (!parsed.success) return { ok: false, error: "Ugyldig ukestart." };

  const access = await kreverTilgangTilSpiller(params.playerId);
  if (!access) return { ok: false, error: INGEN_TILGANG };
  const viewer = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const weekStart = mondayOf(parsed.data);
  const weekEnd = addDays(weekStart, 7);
  const [year, month, day] = weekStart.split("-").map(Number);
  const [endYear, endMonth, endDay] = weekEnd.split("-").map(Number);
  const bookingStart = osloInstant(year, month, day, 0, 0);
  const bookingEnd = osloInstant(endYear, endMonth, endDay, 0, 0);

  const [sessionRows, bookingRows, templateRows] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        coachId: viewer.id,
        date: { gte: tilDatoKolonne(weekStart), lt: tilDatoKolonne(weekEnd) },
        status: { not: "CANCELLED" },
      },
      include: { drills: true },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        coachId: viewer.id,
        startAt: { gte: bookingStart, lt: bookingEnd },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        guestName: true,
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.workbenchSession.findMany({
      where: { coachId: viewer.id, isTemplate: true },
      select: { id: true, title: true, durationMinutes: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const playerIds = [...new Set(sessionRows.map((row) => row.playerId))];
  const players = playerIds.length
    ? await prisma.user.findMany({
        where: { AND: [coachScopedPlayerWhere(viewer), { id: { in: playerIds } }] },
        select: { id: true, name: true },
      })
    : [];
  const playerNames = new Map(players.map((player) => [player.id, player.name ?? UI.unnamedPlayer]));

  const items: MinKalenderItem[] = sessionRows
    .filter((row) => playerNames.has(row.playerId))
    .map((row) => {
      const session = mapSession(row);
      return {
        id: `workbench:${row.id}`,
        kind: "WORKBENCH" as const,
        date: session.date,
        startMinute: session.startMinute,
        durationMinutes: session.durationMinutes,
        title: `${playerNames.get(row.playerId)} · ${session.title}`,
        subtitle: session.title,
        pyramid: session.pyramid,
        href: `/admin/workbench/${row.playerId}?vis=okt&uke=${weekStart}&okt=${row.id}`,
        session,
      };
    });

  for (const booking of bookingRows) {
    const start = osloDatoOgMinutt(booking.startAt);
    const durationMinutes = Math.max(15, Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000));
    const name = booking.user?.name ?? booking.guestName ?? "Booking";
    items.push({
      id: `booking:${booking.id}`,
      kind: "BOOKING",
      date: start.date,
      startMinute: start.minute,
      durationMinutes,
      title: `${name} · ${booking.serviceType.name}`,
      subtitle: booking.serviceType.name,
      href: `/admin/bookinger/${booking.id}`,
    });
  }

  const now = osloDatoOgMinutt(new Date());
  return {
    ok: true,
    data: {
      weekStart,
      days: Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        return { date, items: items.filter((item) => item.date === date).sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id)) };
      }),
      templates: templateRows.map((row) => ({ id: row.id, title: row.title, subtitle: `${row.durationMinutes} min` })),
      bookings: bookingRows.map((row) => ({
        id: row.id,
        title: row.user?.name ?? row.guestName ?? "Booking",
        subtitle: `${osloDatoOgMinutt(row.startAt).date} · ${formatMinutt(osloDatoOgMinutt(row.startAt).minute)}`,
      })),
      todayIso: now.date,
      nowMinute: now.minute,
    },
  };
}

function formatMinutt(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

async function lastOkterIVindu(
  playerId: string,
  fraIso: string,
  tilIso: string,
  viewerId: string,
): Promise<WorkbenchSession[]> {
  const fra = tilDatoKolonne(fraIso);
  const til = tilDatoKolonne(tilIso);
  const erSpillerenSelv = viewerId === playerId;
  const rows = await prisma.workbenchSession.findMany({
    where: {
      playerId,
      date: { gte: fra, lte: til },
      ...(erSpillerenSelv ? { hiddenByPlayer: false } : {}),
    },
    include: { drills: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });
  return rows.map(mapSession);
}

/**
 * Månedskalender — leseflate (C1). Inneholder DRAFT for coach.
 * Rutenettet starter mandag i uka som inneholder den 1., slik at uketall
 * og klikk-til-uke treffer hele uker.
 */
export async function loadMonth(params: {
  monthStart: string;
  mode: WorkbenchMode;
  playerId: string;
  targetMinutes?: number;
}): Promise<WbResultat<MonthViewModel>> {
  const parsed = IsoDateSchema.safeParse(params.monthStart);
  if (!parsed.success) return { ok: false, error: "Ugyldig måned." };
  const monthStart = monthStartOf(parsed.data);

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const last = lastDayOfMonth(monthStart);
  const gridStart = mondayOf(monthStart);
  const gridEnd = addDays(mondayOf(last), 6);
  const sessions = await lastOkterIVindu(params.playerId, gridStart, gridEnd, viewer.id);
  const [y, m] = monthStart.split("-").map(Number);
  const label = `${UI.monthNames[m - 1]} ${y}`;
  const idagIso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  return {
    ok: true,
    data: buildMonthViewModel(
      monthStart,
      sessions,
      params.mode,
      params.targetMinutes ?? 0,
      label,
      idagIso,
    ),
  };
}

/** Årsplan — leseflate (C1). Ingen redigering i årscelle. */
export async function loadYear(params: {
  year: number;
  mode: WorkbenchMode;
  playerId: string;
  targetMinutes?: number;
}): Promise<WbResultat<YearViewModel>> {
  if (!Number.isInteger(params.year) || params.year < 2000 || params.year > 2100) {
    return { ok: false, error: "Ugyldig år." };
  }
  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const yearStart = new Date(Date.UTC(params.year, 0, 1));
  const yearEnd = new Date(Date.UTC(params.year, 11, 31, 23, 59, 59));

  const [sessions, seasonPlan, tournamentEntries, testResults] = await Promise.all([
    lastOkterIVindu(params.playerId, `${params.year}-01-01`, `${params.year}-12-31`, viewer.id),
    prisma.seasonPlan.findFirst({
      where: { userId: params.playerId, year: params.year },
      include: { periodBlocks: { orderBy: { startDate: "asc" } } },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId: params.playerId,
        entryStatus: { not: "WITHDRAWN" },
        OR: [
          { tournament: { startDate: { gte: yearStart, lte: yearEnd } } },
          { manualDate: { gte: yearStart, lte: yearEnd } },
        ],
      },
      select: {
        tournament: { select: { name: true, startDate: true } },
        manualName: true,
        manualDate: true,
      },
    }),
    prisma.testResult.findMany({
      where: { userId: params.playerId, takenAt: { gte: yearStart, lte: yearEnd } },
      select: { takenAt: true, test: { select: { name: true } } },
    }),
  ]);

  const idagIso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const periodInput = (seasonPlan?.periodBlocks ?? []).map((b) => ({
    id: b.id,
    type: b.lPhase,
    startDate: fraDatoKolonne(b.startDate),
    endDate: fraDatoKolonne(b.endDate),
    focus: b.focus,
  }));
  const tournamentEvents = tournamentEntries
    .map((e) => {
      const navn = e.tournament?.name ?? e.manualName;
      const dato = e.tournament?.startDate ?? e.manualDate;
      return navn && dato ? { navn, dato: fraDatoKolonne(dato) } : null;
    })
    .filter((x): x is { navn: string; dato: string } => x !== null);
  const testEvents = testResults.map((t) => ({
    navn: t.test.name,
    dato: fraDatoKolonne(t.takenAt),
  }));

  return {
    ok: true,
    data: buildYearViewModel(
      params.year,
      sessions,
      params.mode,
      params.targetMinutes ?? 0,
      periodInput,
      tournamentEvents,
      testEvents,
      idagIso,
    ),
  };
}

/** Periodeplan — lagrede PeriodBlock-data og faktiske økter for valgt periode. */
export async function loadPeriod(params: {
  year: number;
  mode: WorkbenchMode;
  playerId: string;
  periodId?: string;
}): Promise<WbResultat<PeriodViewModel>> {
  if (!Number.isInteger(params.year) || params.year < 2000 || params.year > 2100) {
    return { ok: false, error: "Ugyldig år." };
  }
  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const yearStart = new Date(Date.UTC(params.year, 0, 1));
  const yearEnd = new Date(Date.UTC(params.year, 11, 31, 23, 59, 59));
  const [sessions, seasonPlan, tournamentEntries] = await Promise.all([
    lastOkterIVindu(params.playerId, `${params.year}-01-01`, `${params.year}-12-31`, viewer.id),
    prisma.seasonPlan.findFirst({
      where: { userId: params.playerId, year: params.year },
      include: { periodBlocks: { orderBy: { startDate: "asc" } } },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId: params.playerId,
        entryStatus: { not: "WITHDRAWN" },
        OR: [
          { tournament: { startDate: { gte: yearStart, lte: yearEnd } } },
          { manualDate: { gte: yearStart, lte: yearEnd } },
        ],
      },
      select: {
        tournament: { select: { name: true, startDate: true } },
        manualName: true,
        manualDate: true,
      },
    }),
  ]);

  const idagIso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const periodInput = (seasonPlan?.periodBlocks ?? []).map((block) => ({
    id: block.id,
    type: block.lPhase,
    startDate: fraDatoKolonne(block.startDate),
    endDate: fraDatoKolonne(block.endDate),
    focus: block.focus,
  }));
  const tournamentEvents = tournamentEntries
    .map((entry) => {
      const navn = entry.tournament?.name ?? entry.manualName;
      const dato = entry.tournament?.startDate ?? entry.manualDate;
      return navn && dato ? { navn, dato: fraDatoKolonne(dato) } : null;
    })
    .filter((entry): entry is { navn: string; dato: string } => entry !== null);
  const year = buildYearViewModel(
    params.year,
    sessions,
    params.mode,
    0,
    periodInput,
    tournamentEvents,
    [],
    idagIso,
  );

  return {
    ok: true,
    data: buildPeriodViewModel(
      params.year,
      year.periods,
      params.periodId ?? null,
      sessions,
      params.mode,
      idagIso,
    ),
  };
}

/** Én økt — inspektør / dyplenke. */
export async function loadSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession | null>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) {
    return treff.feil === FINNES_IKKE
      ? { ok: true, data: null }
      : { ok: false, error: treff.feil };
  }
  return { ok: true, data: mapSession(treff.row) };
}

/**
 * Stall · dag (Loop 6 / C2): spillere som kolonner for én dag, med UTKAST
 * synlig — kun coach/admin. Gjenbruker `loadStallen` (samme entitlement- og
 * coach-scope som `/admin/spillere`) for spillerlista, henter dagens økter
 * direkte fra `WorkbenchSession`, og lar den rene aggregatoren gruppere.
 */
export async function loadStallDag(params: {
  dato: string;
}): Promise<WbResultat<StallDagViewModel>> {
  const dato = IsoDateSchema.safeParse(params.dato);
  if (!dato.success) return { ok: false, error: "Ugyldig dato." };

  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const stall = await loadStallen({ id: user.id, role: user.role }, {});

  const dag = tilDatoKolonne(dato.data);
  const spillerIder = stall.rows.map((r) => r.id);
  const okterRader = spillerIder.length
    ? await prisma.workbenchSession.findMany({
        where: { playerId: { in: spillerIder }, date: dag },
        include: { drills: true },
        orderBy: [{ startMinute: "asc" }],
      })
    : [];

  const vm = buildStallDagViewModel(
    dato.data,
    stall.rows.map((r) => ({ id: r.id, navn: r.name || UI.unnamedPlayer })),
    okterRader.map(mapSession),
  );
  return { ok: true, data: vm };
}

const UKEDAG_KORT = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

/**
 * Kildepanelet (øvelsesbank, maler, forrige uke).
 * `weekStart` er valgfri — mangler den (f.eks. eldre kall) faller «forrige
 * uke» tilbake på de siste 7 dagene før i dag (Oslo).
 */
export async function loadSources(params: {
  playerId: string;
  weekStart?: string;
}): Promise<WbResultat<SourceItem[]>> {
  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const ukeStart = params.weekStart
    ? tilDatoKolonne(params.weekStart)
    : tilDatoKolonne(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()));
  const forrigeFra = new Date(ukeStart);
  forrigeFra.setUTCDate(forrigeFra.getUTCDate() - 7);
  const forrigeTil = new Date(ukeStart);
  forrigeTil.setUTCDate(forrigeTil.getUTCDate() - 1);

  const [ovelser, maler, forrigeUke, tekniskPanel] = await Promise.all([
    prisma.exerciseDefinition.findMany({
      where: {
        OR: [
          { source: "SYSTEM" },
          { source: "COACH", visibility: "COACH_PLAYERS" },
          { createdBy: viewer.id },
        ],
      },
      orderBy: { name: "asc" },
      take: 60,
    }),
    prisma.workbenchSession.findMany({
      where: { playerId: params.playerId, isTemplate: true },
      include: { drills: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.workbenchSession.findMany({
      where: { playerId: params.playerId, date: { gte: forrigeFra, lte: forrigeTil } },
      include: { drills: true },
      orderBy: { date: "asc" },
      take: 20,
    }),
    hentTekniskPanel(params.playerId),
  ]);

  const tekniskeKilder: SourceItem[] = tekniskPanel?.oppgaver
    ? tekniskPanel.oppgaver.map(tekniskOppgaveToSourceItem)
    : [];

  const data: SourceItem[] = [
    ...tekniskeKilder,
    ...ovelser.map(exerciseToSourceItem),
    ...maler.map(templateToSourceItem),
    ...forrigeUke.map((row) => {
      const dagIndex = (row.date.getUTCDay() + 6) % 7; // man=0 … søn=6
      return previousWeekToSourceItem(row, UKEDAG_KORT[dagIndex] ?? "");
    }),
  ];
  return { ok: true, data };
}

/** Én økt slik den vises spilleren i «I dag» — se `loadPlayerDay`. */
export type PlayerDaySession = {
  id: string;
  title: string;
  startMinute: number;
  durationMinutes: number;
  pyramid: string;
  status: string;
  drillsCount: number;
  location?: string;
  /** Coach-notat som vises på Nå-kortet («mål 8/12 i vindu»). */
  notes?: string;
  /** Hvor økten kommer fra — styrer «Forslag fra coach»/«Forslag fra gruppe»-copy. */
  origin: string;
  /** Venter på Godta/Avvis (Loop 3T/B6) — se `resolvePlayerApproval`. */
  needsPlayerApproval: boolean;
  approvalStatus?: string;
};

/** Resultattype for `loadPlayerDay` — brukt av klientkomponenter (type-only import). */
export type PlayerDayResult = WbResultat<{
  date: string;
  sessions: PlayerDaySession[];
  nextSessionId: string | null;
}>;

/**
 * Player HQ «I dag». Returnerer ALDRI DRAFT — kun publiserte, pågående og
 * fullførte økter. Dette er den harde regelen i hele Loop 1.
 */
export async function loadPlayerDay(params: {
  playerId: string;
  date: string;
}): Promise<PlayerDayResult> {
  const dato = IsoDateSchema.safeParse(params.date);
  if (!dato.success) return { ok: false, error: "Ugyldig dato." };

  const viewer = await kreverTilgangTilSpiller(params.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const rows = await prisma.workbenchSession.findMany({
    where: {
      playerId: params.playerId,
      date: tilDatoKolonne(dato.data),
      status: { in: [...SPILLER_SYNLIGE_STATUSER] },
      // Avvist/«ikke delta» — skjult hos spilleren, aldri slettet (WB-10).
      hiddenByPlayer: false,
    },
    include: { drills: true },
    orderBy: { startMinute: "asc" },
  });

  const sessions = rows.map(mapSession).map((s) => ({
    id: s.id,
    title: s.title,
    startMinute: s.startMinute,
    durationMinutes: s.durationMinutes,
    pyramid: s.pyramid,
    status: s.status,
    drillsCount: s.drills.length,
    location: s.location,
    notes: s.notes,
    origin: s.origin,
    needsPlayerApproval: s.needsPlayerApproval ?? false,
    approvalStatus: s.approvalStatus,
  }));

  // Venter-på-godkjenning-økter kan ikke startes ennå — regnes ikke som «neste».
  const neste =
    sessions.find((s) => s.status !== "COMPLETED" && !s.needsPlayerApproval && s.approvalStatus !== "REJECTED")?.id ??
    null;

  return { ok: true, data: { date: dato.data, sessions, nextSessionId: neste } };
}

/**
 * Spillerens eget økt-ark. I motsetning til `loadSession` (coach-siden)
 * filtrerer denne PÅ STATUS i tillegg til eierskap — DRAFT er aldri synlig
 * for spilleren, selv om spilleren selv eier raden (invariant 3, CLAUDE.md).
 * Kun spilleren selv (ikke coach) bruker denne — coach har inspektøren.
 */
export async function loadPlayerSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession | null>> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const row = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row || row.playerId !== user.id || row.hiddenByPlayer) return { ok: true, data: null };

  const session = mapSession(row);
  const synligStatuser: readonly string[] = SPILLER_SYNLIGE_STATUSER;
  if (!synligStatuser.includes(session.status)) return { ok: true, data: null };

  return { ok: true, data: session };
}

// ─── Skriving ───────────────────────────────────────────────────────────────

async function lagreOgHent(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  const row = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row) return { ok: false, error: FINNES_IKKE };
  revalider(row.playerId);
  return { ok: true, data: mapSession(row) };
}

/** Ny økt. Alltid DRAFT — spilleren ser den først etter publisering. */
export async function createSession(
  input: CreateSessionInput,
): Promise<WbResultat<WorkbenchSession>> {
  const parsed = CreateSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldige felter." };
  }
  const cmd = parsed.data;

  const viewer = await kreverTilgangTilSpiller(cmd.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const erCoach = viewer.id !== cmd.playerId;
  const utkast = createSessionPure({
    playerId: cmd.playerId,
    coachId: viewer.id,
    date: cmd.date,
    startMinute: cmd.startMinute,
    durationMinutes: cmd.durationMinutes,
    title: cmd.title,
    pyramid: cmd.pyramid,
    blockType: cmd.blockType,
    environment: cmd.environment,
    notes: cmd.notes,
    groupId: cmd.groupId,
    drills: cmd.drills,
    createdBy: erCoach ? "COACH" : "PLAYER",
  });

  const rad = await prisma.workbenchSession.create({
    data: sessionOpprettelseData(utkast),
    include: { drills: true },
  });

  revalider(rad.playerId);
  return { ok: true, data: mapSession(rad) };
}

/**
 * Ny økt gjentatt ukentlig — hver forekomst deler `seriesId`, egen dag/tid
 * (startMinute/date) beholdes per forekomst uansett senere endre-policy.
 */
export async function createSessionSeries(
  input: CreateSessionSeriesInput,
): Promise<WbResultat<WorkbenchSession[]>> {
  const parsed = CreateSessionSeriesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldige felter." };
  }
  const cmd = parsed.data;

  const viewer = await kreverTilgangTilSpiller(cmd.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const erCoach = viewer.id !== cmd.playerId;
  const forekomster = createSessionSeriesPure(
    {
      playerId: cmd.playerId,
      coachId: viewer.id,
      date: cmd.date,
      startMinute: cmd.startMinute,
      durationMinutes: cmd.durationMinutes,
      title: cmd.title,
      pyramid: cmd.pyramid,
      blockType: cmd.blockType,
      environment: cmd.environment,
      notes: cmd.notes,
      groupId: cmd.groupId,
      drills: cmd.drills,
      createdBy: erCoach ? "COACH" : "PLAYER",
    },
    cmd.repeatWeeks,
  );

  const rader = await prisma.$transaction(
    forekomster.map((s) =>
      prisma.workbenchSession.create({
        data: sessionOpprettelseData(s),
        include: { drills: true },
      }),
    ),
  );

  revalider(cmd.playerId);
  return { ok: true, data: rader.map(mapSession) };
}

/**
 * Dra en kilde (øvelse, mal eller en tidligere ukes økt) inn i uka.
 * Øvelser blir en ny énøvelse-økt; mal/forrige uke gjenskaper hele økten
 * på den nye dagen/tiden.
 */
export async function createSessionFromSource(input: {
  playerId: string;
  sourceId: string;
  date: string;
  startMinute: number;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = CreateFromSourceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig kilde." };
  }

  const viewer = await kreverTilgangTilSpiller(parsed.data.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const kilde = parseSourceId(parsed.data.sourceId);
  if (!kilde) return { ok: false, error: "Ukjent kilde." };

  const erCoach = viewer.id !== parsed.data.playerId;
  let utkast: WorkbenchSession;

  if (kilde.kind === "DRILL") {
    const rad = await prisma.exerciseDefinition.findUnique({ where: { id: kilde.exerciseId } });
    if (!rad) return { ok: false, error: "Fant ikke øvelsen." };
    const drill = exerciseToSourceItem(rad).drill;
    if (!drill) return { ok: false, error: "Fant ikke øvelsen." };

    utkast = createSessionPure({
      playerId: parsed.data.playerId,
      coachId: viewer.id,
      date: parsed.data.date,
      startMinute: parsed.data.startMinute,
      durationMinutes: drill.durationMinutes,
      title: drill.title,
      pyramid: drill.akFormel.pyramid,
      drills: [drill],
      createdBy: erCoach ? "COACH" : "PLAYER",
    });
  } else if (kilde.kind === "TEK") {
    const task = await prisma.positionTask.findUnique({
      where: { id: kilde.taskId },
      include: { position: true },
    });
    if (!task) return { ok: false, error: "Fant ikke teknisk oppgave." };

    const omrade = omraadeKodeTilTrainingArea(task.omraadeKode);
    const formelLabel = `Teknisk · ${task.position.pNummer} ${task.position.navn}`;
    const drill: Omit<Drill, "id" | "order"> = {
      title: `${task.position.pNummer} ${task.tittel}`,
      description: task.dimensjon
        ? `${task.dimensjon}${task.koller.length > 0 ? ` (${task.koller.join(", ")})` : ""}`
        : task.slagNavn ?? undefined,
      durationMinutes: 20,
      techniqueFocus: task.position.pNummer,
      sourceId: task.id,
      akFormel: {
        pyramid: "TEK",
        area: omrade,
        motorikk: (task.motorikk as Motorikk) ?? undefined,
        label: formelLabel,
      },
    };

    utkast = createSessionPure({
      playerId: parsed.data.playerId,
      coachId: viewer.id,
      date: parsed.data.date,
      startMinute: parsed.data.startMinute,
      durationMinutes: drill.durationMinutes,
      title: `${task.position.pNummer} · ${task.tittel}`,
      pyramid: "TEK",
      drills: [drill],
      notes: task.dimensjon ? `Fokus: ${task.dimensjon}. Køller: ${task.koller.join(", ")}` : undefined,
      createdBy: erCoach ? "COACH" : "PLAYER",
    });
  } else {
    const rad = await prisma.workbenchSession.findUnique({
      where: { id: kilde.sessionId },
      include: { drills: true },
    });
    if (!rad || rad.playerId !== parsed.data.playerId) {
      return { ok: false, error: "Fant ikke kilden." };
    }
    const kildeOkt = mapSession(rad);

    utkast = createSessionPure({
      playerId: parsed.data.playerId,
      coachId: viewer.id,
      date: parsed.data.date,
      startMinute: parsed.data.startMinute,
      durationMinutes: kildeOkt.durationMinutes,
      title: kildeOkt.title,
      pyramid: kildeOkt.pyramid,
      blockType: kildeOkt.blockType,
      environment: kildeOkt.environment,
      notes: kildeOkt.notes,
      drills: kildeOkt.drills.map((d) => ({
        title: d.title,
        description: d.description,
        durationMinutes: d.durationMinutes,
        akFormel: d.akFormel,
        techniqueFocus: d.techniqueFocus,
        sourceId: d.sourceId,
      })),
      createdBy: erCoach ? "COACH" : "PLAYER",
    });
  }

  const rad2 = await prisma.workbenchSession.create({
    data: sessionOpprettelseData(utkast),
    include: { drills: true },
  });

  revalider(rad2.playerId);
  return { ok: true, data: mapSession(rad2) };
}

/** Dra en øvelse eller teknisk oppgave fra kildepanelet rett inn i en eksisterende økt. */
export async function addDrillFromSource(input: {
  sessionId: string;
  sourceId: string;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = AddDrillFromSourceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig kilde." };
  }

  const kilde = parseSourceId(parsed.data.sourceId);
  if (!kilde || (kilde.kind !== "DRILL" && kilde.kind !== "TEK")) {
    return { ok: false, error: "Kun øvelser og tekniske oppgaver kan dras inn på en eksisterende økt." };
  }

  let drill: Omit<Drill, "id" | "order"> | undefined;

  if (kilde.kind === "DRILL") {
    const rad = await prisma.exerciseDefinition.findUnique({ where: { id: kilde.exerciseId } });
    if (!rad) return { ok: false, error: "Fant ikke øvelsen." };
    drill = exerciseToSourceItem(rad).drill;
    if (!drill) return { ok: false, error: "Fant ikke øvelsen." };
  } else if (kilde.kind === "TEK") {
    const task = await prisma.positionTask.findUnique({
      where: { id: kilde.taskId },
      include: { position: true },
    });
    if (!task) return { ok: false, error: "Fant ikke teknisk oppgave." };
    const omrade = omraadeKodeTilTrainingArea(task.omraadeKode);
    const formelLabel = `Teknisk · ${task.position.pNummer} ${task.position.navn}`;
    drill = {
      title: `${task.position.pNummer} ${task.tittel}`,
      description: task.dimensjon
        ? `${task.dimensjon}${task.koller.length > 0 ? ` (${task.koller.join(", ")})` : ""}`
        : task.slagNavn ?? undefined,
      durationMinutes: 20,
      techniqueFocus: task.position.pNummer,
      sourceId: task.id,
      akFormel: {
        pyramid: "TEK",
        area: omrade,
        motorikk: (task.motorikk as Motorikk) ?? undefined,
        label: formelLabel,
      },
    };
  }

  if (!drill) return { ok: false, error: "Kunne ikke hente kilden." };

  return addDrill({ sessionId: parsed.data.sessionId, drill });
}

/** Flytt / endre lengde. */
export async function moveSession(input: {
  sessionId: string;
  newDate: string;
  newStartMinute: number;
  newDurationMinutes?: number;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = MoveSessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig flytting." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const flyttet = moveSessionPure(mapSession(treff.row), {
    sessionId: parsed.data.sessionId,
    newDate: parsed.data.newDate,
    newStartMinute: parsed.data.newStartMinute,
    newDurationMinutes: parsed.data.newDurationMinutes,
  });

  await prisma.workbenchSession.update({
    where: { id: parsed.data.sessionId },
    data: {
      date: tilDatoKolonne(flyttet.date),
      startMinute: flyttet.startMinute,
      durationMinutes: flyttet.durationMinutes,
    },
  });

  return lagreOgHent(parsed.data.sessionId);
}

/** Publiser et utvalg økter — dette er øyeblikket spilleren ser dem. */
export async function publishSessions(
  sessionIds: string[],
): Promise<WbResultat<WorkbenchSession[]>> {
  if (sessionIds.length === 0) return { ok: true, data: [] };

  let publiserte: WorkbenchSession[];
  try {
    publiserte = await prisma.$transaction(async (tx) => {
      const klargjorte = [];
      // Hele utvalget må være gyldig før første skriving.
      for (const id of new Set(sessionIds)) {
        const treff = await hentMedTilgang(id, tx);
        if ("feil" in treff) throw new Error(treff.feil);
        const neste = publishSessionPure(mapSession(treff.row), {
          sessionId: id,
          publishedBy: treff.viewer.id,
        });
        klargjorte.push({ row: treff.row, neste });
      }
      const rows = [];
      for (const { row, neste } of klargjorte) {
        rows.push(await tx.workbenchSession.update({
          // Avbryt hele utvalget dersom en annen klient har endret en økt.
          where: { id: row.id, updatedAt: row.updatedAt },
          data: {
            status: neste.status,
            publishedAt: neste.publishedAt ? new Date(neste.publishedAt) : null,
            publishedBy: neste.publishedBy ?? null,
          },
          include: { drills: true },
        }));
      }
      return rows.map(mapSession);
    });
  } catch {
    return { ok: false, error: "Ingen økter ble publisert. Kontroller tilgang og øktstatus, og prøv igjen." };
  }
  for (const playerId of new Set(publiserte.map((s) => s.playerId))) revalider(playerId);
  return { ok: true, data: publiserte };
}

/** Trekk tilbake — økten blir utkast igjen og forsvinner fra spillerens dag. */
export async function unpublishSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const neste = unpublishSessionPure(mapSession(treff.row));
  await prisma.workbenchSession.update({
    where: { id: sessionId },
    data: { status: neste.status, publishedAt: null, publishedBy: null },
  });

  return lagreOgHent(sessionId);
}

/** Legg til øvelse. Vokser øktlengden hvis øvelsene blir lengre enn økten. */
export async function addDrill(input: {
  sessionId: string;
  drill: z.infer<typeof DrillInputSchema>;
  atIndex?: number;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = DrillInputSchema.safeParse(input.drill);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig øvelse." };
  }

  const treff = await hentMedTilgang(input.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const neste = addDrillPure(mapSession(treff.row), {
    sessionId: input.sessionId,
    drill: parsed.data,
    atIndex: input.atIndex,
  });

  await prisma.$transaction(async (tx) => {
    await tx.workbenchDrill.deleteMany({ where: { sessionId: input.sessionId } });
    await tx.workbenchSession.update({
      where: { id: input.sessionId },
      data: {
        durationMinutes: neste.durationMinutes,
        drills: {
          create: neste.drills.map((d) => ({
            title: d.title,
            description: d.description ?? null,
            durationMinutes: d.durationMinutes,
            akFormel: akFormelTilJson(d.akFormel),
            techniqueFocus: d.techniqueFocus ?? null,
            sourceId: d.sourceId ?? null,
            sortOrder: d.order,
          })),
        },
      },
    });
  });

  return lagreOgHent(input.sessionId);
}

/** Ny rekkefølge på øvelsene. */
export async function reorderDrills(input: {
  sessionId: string;
  orderedDrillIds: string[];
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = ReorderDrillsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig rekkefølge." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const neste = reorderDrillsPure(mapSession(treff.row), {
    sessionId: parsed.data.sessionId,
    orderedDrillIds: parsed.data.orderedDrillIds,
  });

  await prisma.$transaction(
    neste.drills.map((d) =>
      prisma.workbenchDrill.update({
        where: { id: d.id },
        data: { sortOrder: d.order },
      }),
    ),
  );

  return lagreOgHent(parsed.data.sessionId);
}

/** Fjern én øvelse og reindekser resten. */
export async function removeDrill(input: {
  sessionId: string;
  drillId: string;
}): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(input.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  if (!treff.row.drills.some((d) => d.id === input.drillId)) {
    return { ok: false, error: "Fant ikke øvelsen i denne økten." };
  }

  const beholdt = treff.row.drills
    .filter((d) => d.id !== input.drillId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  await prisma.$transaction([
    prisma.workbenchDrill.delete({ where: { id: input.drillId } }),
    ...beholdt.map((d, i) =>
      prisma.workbenchDrill.update({
        where: { id: d.id },
        data: { sortOrder: i },
      }),
    ),
  ]);

  return lagreOgHent(input.sessionId);
}

/** Slett økten. Øvelsene følger med (ON DELETE CASCADE). */
export async function deleteSession(
  sessionId: string,
): Promise<WbResultat<null>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  await prisma.workbenchSession.delete({ where: { id: sessionId } });
  revalider(treff.row.playerId);
  return { ok: true, data: null };
}

/** Hvilke rader i samme serie en policy treffer — henter serien kun ved behov. */
async function serieMalRammer(
  gjeldende: WorkbenchSession,
  policy: RecurrencePolicy,
): Promise<WorkbenchSession[]> {
  if (!gjeldende.seriesId || policy === "DENNE") return [gjeldende];
  const serieRader = await prisma.workbenchSession.findMany({
    where: { seriesId: gjeldende.seriesId },
    include: { drills: true },
  });
  return sessionsMatchingPolicy(serieRader.map(mapSession), gjeldende.id, policy);
}

/**
 * Innholdsendring (tittel/pyramide/blokktype/miljø/notater) på én økt eller
 * flere forekomster i samme serie — ALDRI dato/tid, de er per forekomst.
 */
export async function updateSeriesSession(input: {
  sessionId: string;
  patch: {
    title?: string;
    pyramid?: WorkbenchSession["pyramid"];
    blockType?: WorkbenchSession["blockType"];
    environment?: WorkbenchSession["environment"];
    notes?: string;
  };
  policy: RecurrencePolicy;
}): Promise<WbResultat<WorkbenchSession[]>> {
  const parsed = UpdateSeriesSessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig endring." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const gjeldende = mapSession(treff.row);
  const mal = serieMalPatch(gjeldende, parsed.data.patch);
  const rammer = await serieMalRammer(gjeldende, parsed.data.policy);

  await prisma.$transaction(
    rammer.map((s) =>
      prisma.workbenchSession.update({
        where: { id: s.id },
        data: {
          title: mal.title,
          pyramid: mal.pyramid,
          blockType: mal.blockType,
          environment: mal.environment ?? null,
          notes: mal.notes ?? null,
        },
      }),
    ),
  );

  revalider(gjeldende.playerId);
  const oppdaterte = await prisma.workbenchSession.findMany({
    where: { id: { in: rammer.map((s) => s.id) } },
    include: { drills: true },
  });
  return { ok: true, data: oppdaterte.map(mapSession) };
}

function serieMalPatch(
  session: WorkbenchSession,
  patch: Parameters<typeof updateSeriesSession>[0]["patch"],
): WorkbenchSession {
  return applySeriesPatch(session, patch);
}

/** Slett én forekomst, denne og fremover, eller hele serien. */
export async function deleteSessionSeries(input: {
  sessionId: string;
  policy: RecurrencePolicy;
}): Promise<WbResultat<{ slettet: number }>> {
  const parsed = DeleteSeriesSessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig sletting." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const gjeldende = mapSession(treff.row);
  const rammer = await serieMalRammer(gjeldende, parsed.data.policy);

  await prisma.workbenchSession.deleteMany({ where: { id: { in: rammer.map((s) => s.id) } } });
  revalider(gjeldende.playerId);
  return { ok: true, data: { slettet: rammer.length } };
}

/** Lagre/fjern en økt som mal — dukker opp i kildepanelet under «Maler». */
export async function setSessionTemplate(
  sessionId: string,
  isTemplate: boolean,
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  await prisma.workbenchSession.update({ where: { id: sessionId }, data: { isTemplate } });
  return lagreOgHent(sessionId);
}

// ─── Gjennomføring ──────────────────────────────────────────────────────────

async function settStatus(
  sessionId: string,
  status: "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const row = treff.row;
  if (row.hiddenByPlayer || row.needsPlayerApproval || row.approvalStatus === "REJECTED") {
    return { ok: false, error: "Økten må være synlig og godkjent før gjennomføring." };
  }
  // Gjentatte forespørsler er ufarlige; avsluttet historikk kan ikke gjenåpnes her.
  if (row.status === status) return { ok: true, data: mapSession(row) };
  if (!["PUBLISHED", "IN_PROGRESS"].includes(row.status)) {
    return { ok: false, error: "Økten kan ikke endres fra denne statusen." };
  }
  const liveSnapshot = status === "IN_PROGRESS" && row.liveSnapshot == null
    ? initialWorkbenchLiveSnapshot(row.drills.sort((a, b) => a.sortOrder - b.sortOrder).map((drill) => drill.id))
    : null;
  const result = await prisma.workbenchSession.updateMany({
    where: { id: sessionId, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt,
      hiddenByPlayer: false, needsPlayerApproval: false },
    data: {
      status,
      ...(liveSnapshot ? { liveSnapshot: liveSnapshot as unknown as Prisma.InputJsonValue } : {}),
      ...(status !== "IN_PROGRESS" ? { liveSnapshot: Prisma.DbNull } : {}),
    },
  });
  if (result.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du fortsetter." };
  return lagreOgHent(sessionId);
}

/** Start økten. Et utkast kan ikke startes — det finnes ikke for spilleren. */
export async function startSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "IN_PROGRESS");
}

export async function completeSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "COMPLETED");
}

export async function skipSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "SKIPPED");
}

/** Avslutter pågående økt og starter neste i én transaksjon. */
export async function startNextWorkbenchLiveSession(input: unknown): Promise<WbResultat<WorkbenchSession>> {
  const parsed = StartNextWorkbenchLiveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig øktvalg." };
  if (!parsed.data.currentSessionId) return startSession(parsed.data.nextSessionId);
  if (parsed.data.currentSessionId === parsed.data.nextSessionId) return { ok: false, error: "Velg en annen økt." };

  const [currentAccess, nextAccess] = await Promise.all([
    hentMedTilgang(parsed.data.currentSessionId),
    hentMedTilgang(parsed.data.nextSessionId),
  ]);
  if ("feil" in currentAccess) return { ok: false, error: currentAccess.feil };
  if ("feil" in nextAccess) return { ok: false, error: nextAccess.feil };
  const current = currentAccess.row;
  const next = nextAccess.row;
  if (current.playerId !== next.playerId) return { ok: false, error: INGEN_TILGANG };
  if (current.status !== "IN_PROGRESS" || next.status !== "PUBLISHED") {
    return { ok: false, error: "Øktene er endret. Last inn på nytt før du fortsetter." };
  }
  if (next.hiddenByPlayer || next.needsPlayerApproval || next.approvalStatus === "REJECTED") {
    return { ok: false, error: "Neste økt må være synlig og godkjent før start." };
  }
  const nextSnapshot = initialWorkbenchLiveSnapshot(
    [...next.drills].sort((a, b) => a.sortOrder - b.sortOrder).map((drill) => drill.id),
  );

  try {
    await prisma.$transaction(async (tx) => {
      const completed = await tx.workbenchSession.updateMany({
        where: { id: current.id, playerId: current.playerId, status: "IN_PROGRESS", updatedAt: current.updatedAt },
        data: { status: "COMPLETED", liveSnapshot: Prisma.DbNull },
      });
      const started = await tx.workbenchSession.updateMany({
        where: {
          id: next.id,
          playerId: next.playerId,
          status: "PUBLISHED",
          updatedAt: next.updatedAt,
          hiddenByPlayer: false,
          needsPlayerApproval: false,
        },
        data: { status: "IN_PROGRESS", liveSnapshot: nextSnapshot as unknown as Prisma.InputJsonValue },
      });
      if (completed.count !== 1 || started.count !== 1) throw new Error("collision");
    });
  } catch {
    return { ok: false, error: "Øktene ble endret samtidig. Last inn på nytt før du fortsetter." };
  }
  revalider(next.playerId);
  return lagreOgHent(next.id);
}

/** Lagrer absolutt live-status. Klienten køer kallene, så optimistisk lås avviser gamle overskrivinger. */
export async function saveWorkbenchLiveSnapshot(input: unknown): Promise<WbResultat<{ updatedAtISO: string }>> {
  const parsed = SaveWorkbenchLiveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig live-data." };

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  const row = treff.row;
  if (row.status !== "IN_PROGRESS" || row.hiddenByPlayer || row.needsPlayerApproval || row.approvalStatus === "REJECTED") {
    return { ok: false, error: "Økten er ikke pågående." };
  }

  const expectedIds = [...row.drills].sort((a, b) => a.sortOrder - b.sortOrder).map((drill) => drill.id);
  const incoming = new Map(parsed.data.drills.map((drill) => [drill.drillId, drill]));
  if (incoming.size !== expectedIds.length || expectedIds.some((id) => !incoming.has(id))) {
    return { ok: false, error: "Øvelsene stemmer ikke med økten." };
  }
  if (parsed.data.drills.filter((drill) => drill.status === "active").length > 1) {
    return { ok: false, error: "Bare én øvelse kan pågå om gangen." };
  }

  const current = parseWorkbenchLiveSnapshot(row.liveSnapshot, expectedIds, row.updatedAt.toISOString());
  const updatedAtISO = new Date().toISOString();
  const snapshot = {
    startedAtISO: current.startedAtISO,
    totalSec: parsed.data.totalSec,
    updatedAtISO,
    drills: expectedIds.map((id) => incoming.get(id)!),
    seriesTargets: Object.fromEntries(expectedIds.map((id) => [id, parsed.data.seriesTargets[id] ?? 3])),
  };
  const result = await prisma.workbenchSession.updateMany({
    where: { id: row.id, playerId: row.playerId, status: "IN_PROGRESS", updatedAt: row.updatedAt },
    data: { liveSnapshot: snapshot as unknown as Prisma.InputJsonValue },
  });
  if (result.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Prøv igjen." };
  revalider(row.playerId);
  return { ok: true, data: { updatedAtISO } };
}

// ─── Godkjenning (Loop 3T / B6) ─────────────────────────────────────────────

/**
 * Spillerens ja/nei på en økt som venter på godkjenning (forslag fra coach
 * eller gruppe, se `integration/player-hq.md` §5). Kun spilleren som EIER
 * raden kan svare — en coach med tilgang til spilleren skal ikke kunne
 * godkjenne på spillerens vegne (IDOR-vern utover den generelle
 * eierskapssjekken i `hentMedTilgang`).
 *
 * ACCEPTED rydder kun flaggene. REJECTED skjuler økten
 * (`hiddenByPlayer: true`, samme mekanisme som «Ikke delta» — WB-10) — den
 * slettes ALDRI, og gruppen/coachen ser ingen endring i sin egen plan.
 */
export async function resolvePlayerApproval(
  input: unknown,
): Promise<WbResultat<WorkbenchSession>> {
  const parsed = ResolvePlayerApprovalInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldige felter." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  if (treff.viewer.id !== treff.row.playerId) {
    return { ok: false, error: INGEN_TILGANG };
  }
  if (!treff.row.needsPlayerApproval) {
    return { ok: false, error: "Denne økten venter ikke på godkjenning." };
  }

  const oppdatert = resolvePlayerApprovalPure(mapSession(treff.row), parsed.data.decision);

  await prisma.workbenchSession.update({
    where: { id: parsed.data.sessionId },
    data: {
      approvalStatus: oppdatert.approvalStatus,
      needsPlayerApproval: oppdatert.needsPlayerApproval ?? false,
      hiddenByPlayer: oppdatert.hiddenByPlayer ?? false,
    },
  });

  return lagreOgHent(parsed.data.sessionId);
}
