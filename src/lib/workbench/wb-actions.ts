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
  WeekPlanData,
  WeekViewModel,
  WorkbenchMode,
  WorkbenchSession,
  YearViewModel,
} from "@/lib/domain/workbench/types";
import { UI } from "@/lib/domain/workbench/labels";
import { vaskDetaljer } from "@/lib/domain/workbench/ovelse-detaljer";
import { lastPlanKalenderBlokker } from "@/lib/workbench/plan-kalender-data";
import { weekLockedBlocks } from "@/lib/workbench/locked-blocks";
import {
  initialWorkbenchLiveSnapshot,
  parseWorkbenchLiveSnapshot,
  type WorkbenchLiveData,
} from "@/lib/workbench/live";
import { osloInstant } from "@/lib/jarvis/dagen";
import { harGjennomforingshistorikk, initialSessionExecution, jsonObject, readSessionExecution, sealSessionSnapshot } from "./wb-session-life";
import { mutateSessionExecution } from "./wb-session-life-actions";
import {
  osloDatoOgMinutt,
  type MinKalenderData,
  type MinKalenderItem,
} from "@/lib/workbench/min-calendar";
import {
  AkFormelSchema,
  AkFormelLeseSchema,
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
import { canReadOwnGroupCopy, ownGroupPublicationWhere } from "@/lib/workbench/group-scope";
import { FORMEL_FELT, bevarHistoriskeDrillfelt, gyldigFormelEndring } from "./drill-formel-bevaring";
import { bankOvelseWhere, hentBankReferanser, lastBankOvelse, lastBankOppgave } from "./bank-referanser";
import { hentTekniskPanel } from "@/lib/workbench/teknisk-plan-panel";
import { opprettPeriodeCore, oppdaterPeriodeCore, slettPeriodeCore } from "@/lib/workbench/periode-core";
import { parseSessionBudget } from "@/lib/workbench/perioder";
import {
  isoUkeIdentitet,
  isoUkeMandag,
  parseWeekPlanData,
  SaveWeekPlanInputSchema,
  type ValidatedSaveWeekPlanInput,
} from "@/lib/workbench/ukeplan-schema";

// ─── Resultattype ───────────────────────────────────────────────────────────

export type WbResultat<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const CreateSeasonPlanSchema = z.object({
  playerId: z.string().min(1),
  name: z.string().trim().min(1, "Årsplanen må ha et navn.").max(120),
  notes: z.string().trim().max(1000).optional(),
  startDate: IsoDateSchema,
  endDate: IsoDateSchema,
  source: z.enum(["EMPTY", "PREVIOUS"]),
});

export type CreateSeasonPlanInput = z.infer<typeof CreateSeasonPlanSchema>;

/**
 * AKFormel → Prisma JSON. Eksplisitt felt for felt: et cast ville sneket
 * ugyldige verdier forbi typesjekken (CLAUDE.md invariant 6).
 */
function akFormelTilJson(f: AKFormel): Prisma.InputJsonObject {
  const detaljer = vaskDetaljer(f.pyramid, f.area, f.motorikk, f.detaljer);
  return {
    pyramid: f.pyramid,
    area: f.area,
    label: f.label,
    ...(f.motorikk ? { motorikk: f.motorikk } : {}),
    ...(f.belastning ? { belastning: f.belastning } : {}),
    ...(f.press ? { press: f.press } : {}),
    ...(detaljer ? { detaljer: detaljer as Prisma.InputJsonObject } : {}),
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
  revalidatePath("/portal/planlegge/workbench");
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
  db: Pick<Prisma.TransactionClient, "workbenchSession" | "group"> = prisma,
): Promise<{ row: WbRow; viewer: Viewer } | { feil: string }> {
  const row = await db.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: true },
  });
  if (!row) return { feil: FINNES_IKKE };
  const viewer = await kreverTilgangTilSpiller(row.playerId);
  if (!viewer) return { feil: INGEN_TILGANG };
  if (viewer.id === row.playerId && !canReadOwnGroupCopy(row)) return { feil: INGEN_TILGANG };
  if (row.groupId && !row.sourceGroupSessionId && /^wb-group-[a-f0-9]{64}$/.test(row.id)) {
    // Originalen leses og endres bare gjennom gruppens egne, avgrensede handlinger.
    return { feil: "Bruk gruppeplanen for gruppeoriginalen." };
  }
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
  exerciseId: z.string().min(1).max(200).optional(),
  positionTaskId: z.string().min(1).max(200).optional(),
});

const UpdateDrillSchema = z.object({
  sessionId: z.string().min(1),
  drillId: z.string().min(1),
  expectedUpdatedAt: z.string().datetime().optional(),
  patch: z.object({
    title: DrillInputSchema.shape.title.optional(),
    description: z.string().nullable().optional(),
    durationMinutes: DrillInputSchema.shape.durationMinutes.optional(),
    techniqueFocus: z.string().nullable().optional(),
    // Hele den kjente formelen erstattes; ukjente historiske JSON-felt beholdes.
    akFormel: AkFormelLeseSchema.optional(),
  }).strict().refine(p => Object.values(p).some(v => v !== undefined), "Ingen endringer å lagre."),
}).strict();

export type UpdateDrillInput = z.infer<typeof UpdateDrillSchema>;

class DrillSamtidigEndring extends Error {}

const CreateSessionSchema = z.object({
  playerId: z.string().min(1),
  date: IsoDateSchema,
  startMinute: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().min(15).max(720),
  title: z.string().min(1, "Økten må ha en tittel"),
  pyramid: PyramidAreaSchema,
  blockType: BlockTypeSchema.optional(),
  environment: EnvironmentSchema.optional(),
  notes: z.string().max(5000).optional(),
  rationale: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(160).optional(),
  maalsetning: z.string().trim().max(500).optional(),
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
  expectedUpdatedAt: z.string().datetime().optional(),
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
    rationale: s.rationale || null,
    location: s.location || null,
    maalsetning: s.maalsetning || null,
    practiceType: s.practiceType ?? null,
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
        exerciseId: d.exerciseId ?? null,
        positionTaskId: d.positionTaskId ?? null,
        repType: d.repType ?? null, repAntall: d.repAntall ?? null, repMinutter: d.repMinutter ?? null,
        repSett: d.repSett ?? null, repReps: d.repReps ?? null,
        planRepsUtenBall: d.planRepsUtenBall ?? null, planRepsLavFart: d.planRepsLavFart ?? null, planRepsAuto: d.planRepsAuto ?? null,
        sortOrder: d.order,
      })),
    },
  };
}

// ─── Lesing ─────────────────────────────────────────────────────────────────

/** Oppretter selve årsplanrammen. Eksisterende perioder endres aldri her. */
export async function createSeasonPlan(
  input: CreateSeasonPlanInput,
): Promise<WbResultat<{ id: string; copiedPeriods: number }>> {
  const parsed = CreateSeasonPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig årsplan." };

  const viewer = await kreverTilgangTilSpiller(parsed.data.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const start = tilDatoKolonne(parsed.data.startDate);
  const end = tilDatoKolonne(parsed.data.endDate);
  if (end <= start) return { ok: false, error: "Sluttdato må være etter startdato." };
  const year = start.getUTCFullYear();

  const existing = await prisma.seasonPlan.findUnique({
    where: { userId_year: { userId: parsed.data.playerId, year } },
    include: { periodBlocks: { select: { id: true } } },
  });
  if (existing?.periodBlocks.length) {
    return { ok: false, error: "Årsplanen har allerede perioder. Åpne periodevisningen for å endre dem." };
  }

  const previous = parsed.data.source === "PREVIOUS"
    ? await prisma.seasonPlan.findFirst({
        where: { userId: parsed.data.playerId, year: { lt: year } },
        orderBy: { year: "desc" },
        include: { periodBlocks: { orderBy: { startDate: "asc" } } },
      })
    : null;
  if (parsed.data.source === "PREVIOUS" && !previous) {
    return { ok: false, error: "Fant ingen tidligere årsplan å kopiere." };
  }

  const yearShift = previous ? year - previous.year : 0;
  const shiftYear = (date: Date) => {
    const next = new Date(date);
    next.setUTCFullYear(next.getUTCFullYear() + yearShift);
    return next;
  };

  const plan = await prisma.$transaction(async (tx) => {
    const row = existing
      ? await tx.seasonPlan.update({
          where: { id: existing.id },
          data: { name: parsed.data.name, notes: parsed.data.notes || null, startDate: start, endDate: end },
          select: { id: true },
        })
      : await tx.seasonPlan.create({
          data: { userId: parsed.data.playerId, year, name: parsed.data.name, notes: parsed.data.notes || null, startDate: start, endDate: end },
          select: { id: true },
        });

    if (previous?.periodBlocks.length) {
      await tx.periodBlock.createMany({
        data: previous.periodBlocks.map((period) => ({
          seasonPlanId: row.id,
          lPhase: period.lPhase,
          startDate: shiftYear(period.startDate),
          endDate: shiftYear(period.endDate),
          focus: period.focus,
          weeklyVolMin: period.weeklyVolMin,
          weeklyVolMax: period.weeklyVolMax,
          weeklySessionBudget: period.weeklySessionBudget ?? undefined,
          notes: period.notes,
          sourceGroupId: period.sourceGroupId,
        })),
      });
    }
    return row;
  });

  revalider(parsed.data.playerId);
  revalidatePath(`/admin/workbench/${parsed.data.playerId}`);
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, data: { id: plan.id, copiedPeriods: previous?.periodBlocks.length ?? 0 } };
}

export async function saveSeasonPeriod(input: {
  playerId: string;
  periodId?: string;
  seasonPlanId?: string;
  data: unknown;
}): Promise<WbResultat<{ periodId: string }>> {
  const viewer = await kreverTilgangTilSpiller(input.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };
  if (input.seasonPlanId !== undefined && !["PLAYER", "COACH", "ADMIN"].includes(viewer.role))
    return { ok: false, error: INGEN_TILGANG };
  let periodId = input.periodId;
  if (periodId) {
    const result = await oppdaterPeriodeCore(input.playerId, periodId, input.data, input.seasonPlanId);
    if (!result.ok) return { ok: false, error: result.error ?? "Kunne ikke lagre perioden." };
  } else {
    const result = await opprettPeriodeCore(input.playerId, input.data, input.seasonPlanId);
    if (!result.ok || !result.periodeId) return { ok: false, error: result.error ?? "Kunne ikke opprette perioden." };
    periodId = result.periodeId;
  }
  revalider(input.playerId);
  revalidatePath(`/admin/workbench/${input.playerId}`);
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, data: { periodId } };
}

export async function deleteSeasonPeriod(input: {
  playerId: string;
  periodId: string;
}): Promise<WbResultat<{ periodId: string }>> {
  const viewer = await kreverTilgangTilSpiller(input.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };
  const result = await slettPeriodeCore(input.playerId, input.periodId);
  if (!result.ok) return { ok: false, error: result.error ?? "Kunne ikke fjerne perioden." };
  revalider(input.playerId);
  revalidatePath(`/admin/workbench/${input.playerId}`);
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, data: { periodId: input.periodId } };
}

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

  const mandag = mondayOf(weekStart.data);
  const ukeIdentitet = isoUkeIdentitet(mandag);
  const fra = tilDatoKolonne(mandag);
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
      ...(erSpillerenSelv ? { hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] } : {}),
    },
    include: { drills: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });

  const spiller = await prisma.user.findUnique({ where: { id: params.playerId }, select: { schoolYear: true } });
  const nesteUke = new Date(fra);
  nesteUke.setUTCDate(nesteUke.getUTCDate() + 7);
  const [busy, school, weekPlanRow] = await Promise.all([
    prisma.playerBusyBlock.findMany({
      where: { userId: params.playerId, startAt: { lt: nesteUke } },
      select: { id: true, title: true, startAt: true, endAt: true, recurring: true, isPrivate: true, kind: true },
    }),
    spiller?.schoolYear ? prisma.schoolScheduleEntry.findMany({
      where: { date: { gte: fra, lt: nesteUke }, OR: [{ classYear: spiller.schoolYear }, { classYear: null }] },
      select: { id: true, title: true, date: true, category: true },
    }) : Promise.resolve([]),
    prisma.weekPlan.findUnique({
      where: {
        playerId_isoYear_weekNumber: {
          playerId: params.playerId,
          ...ukeIdentitet,
        },
      },
    }),
  ]);

  const mappedWeekPlan = weekPlanRow ? parseWeekPlanData(weekPlanRow) : null;
  if (weekPlanRow && !mappedWeekPlan) {
    return { ok: false, error: "Den lagrede ukeplanen har ugyldige felt. Planen er ikke endret." };
  }

  let legacyWeekPlanCandidate: WeekViewModel["legacyWeekPlanCandidate"];
  const kalenderaar = Number(mandag.slice(0, 4));
  if (!weekPlanRow && kalenderaar !== ukeIdentitet.isoYear) {
    // Eldre klient kunne bruke mandagens kalenderår. Raden kan også tilhøre
    // en annen uke: behold originalnøkkelen og aldri bruk den som weekPlan.
    const legacyRow = await prisma.weekPlan.findUnique({
      where: { playerId_isoYear_weekNumber: {
        playerId: params.playerId, isoYear: kalenderaar, weekNumber: ukeIdentitet.weekNumber,
      } },
      select: { id: true, isoYear: true, weekNumber: true, seasonPlanId: true },
    });
    if (legacyRow) {
      // Bare kildens metadata valideres, uten ISO-ukerefinement. Historiske
      // ugyldige uke-53-nøkler skal ikke omtolkes, flyttes eller overskrives.
      const metadata = z.object({
        id: z.string().min(1).max(200),
        isoYear: z.number().int().min(1900).max(9998),
        weekNumber: z.number().int().min(1).max(53),
        seasonPlanId: z.string().min(1).max(200).nullable(),
      }).safeParse(legacyRow);
      if (!metadata.success) return { ok: false, error: "En eldre ukeplan har ugyldige metadata og må gjennomgås. Den lagrede planen er ikke endret." };
      legacyWeekPlanCandidate = {
        ...metadata.data,
        warning: "Det er ikke avklart hvilken uke denne planen tilhører. Den eldre planen er bevart og brukes ikke i den viste uka. Gjennomgå den før du lager en ny plan.",
      };
    }
  }

  const planKalender = await lastPlanKalenderBlokker(params.playerId, mandag, viewer.id === params.playerId);
  const vm = buildWeekViewModel(
    mandag,
    rows.map(mapSession),
    weekLockedBlocks(mandag, busy, school).map((day, i) => [...day, ...planKalender[i]]),
    params.mode,
    params.targetMinutes ?? 0,
    mappedWeekPlan,
  );
  if (legacyWeekPlanCandidate) vm.legacyWeekPlanCandidate = legacyWeekPlanCandidate;
  return { ok: true, data: vm };
}

export type SaveWeekPlanInput = ValidatedSaveWeekPlanInput;

export async function saveWeekPlan(
  input: SaveWeekPlanInput
): Promise<WbResultat<WeekPlanData>> {
  const parsed = SaveWeekPlanInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ukeplanen har ugyldige felt. Kontroller uke, timer og heltall." };
  const data = parsed.data;
  const viewer = await kreverTilgangTilSpiller(data.playerId);
  if (!viewer) return { ok: false, error: INGEN_TILGANG };

  const key = { playerId: data.playerId, isoYear: data.isoYear, weekNumber: data.weekNumber };
  const mandag = isoUkeMandag(data.isoYear, data.weekNumber);
  const sesongVindu = {
    userId: data.playerId,
    startDate: { lte: tilDatoKolonne(addDays(mandag, 6)) },
    endDate: { gte: tilDatoKolonne(mandag) },
  };

  try {
    // Sesongåret kan krysse kalenderåret. En eksplisitt kobling må eies av
    // spilleren og overlappe den faktiske uka; gammel klient beholder gyldig kobling.
    const existing = await prisma.weekPlan.findUnique({
      where: { playerId_isoYear_weekNumber: key }, select: { seasonPlanId: true, planningDetails: true, updatedAt: true },
    });
    let seasonPlanId: string | null = null;
    const beholdTomKobling = data.seasonPlanId === undefined && existing?.seasonPlanId === null;
    if (data.seasonPlanId !== null && !beholdTomKobling) {
      const foretrukketId = data.seasonPlanId ?? existing?.seasonPlanId;
      const foretrukket = foretrukketId ? await prisma.seasonPlan.findFirst({
        where: { ...sesongVindu, id: foretrukketId }, select: { id: true },
      }) : null;
      if (data.seasonPlanId !== undefined && !foretrukket) {
        return { ok: false, error: "Årsplanen tilhører ikke spilleren eller dekker ikke denne uka." };
      }
      const sesong = foretrukket ?? await prisma.seasonPlan.findFirst({
        where: sesongVindu, select: { id: true },
        orderBy: [{ startDate: "desc" }, { year: "desc" }],
      });
      seasonPlanId = sesong?.id ?? null;
    }

    // Udefinert felt betyr behold. null betyr eksplisitt tøm, også for JSON.
    // Vi skriver feltene direkte, uten å lese og overskrive hele legacy-raden.
    const tidligereDetaljer = existing?.planningDetails ? parseWeekPlanData({ ...key, id: "metadata", weekType: "UTVIKLING", notes: [], planningDetails: existing.planningDetails })?.planningDetails : null;
    if (existing?.planningDetails && !tidligereDetaljer) return { ok: false, error: "Den lagrede ukeplanen må gjennomgås før den endres." };
    if (tidligereDetaljer?.cycle && data.planningDetails === null) return { ok: false, error: "Oppløs treukerssyklusen før ukeplandetaljene tømmes." };
    if (data.planningDetails?.cycle && JSON.stringify(data.planningDetails.cycle) !== JSON.stringify(tidligereDetaljer?.cycle)) return { ok: false, error: "Sykluskoblingen endres gjennom treukerssyklusen." };
    const nyeDetaljer = data.planningDetails && tidligereDetaljer?.cycle ? { ...data.planningDetails, cycle: tidligereDetaljer.cycle } : data.planningDetails;
    const felter = {
      seasonPlanId,
      weekType: data.weekType,
      notes: data.notes,
      plannedHoursFys: data.plannedHoursFys,
      plannedHoursTek: data.plannedHoursTek,
      plannedHoursSlag: data.plannedHoursSlag,
      plannedHoursSpill: data.plannedHoursSpill,
      plannedHoursTurn: data.plannedHoursTurn,
      repTargetDry: data.repTargetDry,
      repTargetLowSpeed: data.repTargetLowSpeed,
      repTargetFullSpeed: data.repTargetFullSpeed,
      repTargetPutting: data.repTargetPutting,
      repTargetShortGame: data.repTargetShortGame,
      loadCeiling: data.loadCeiling,
      customNotes: data.customNotes,
      ...(data.planningDetails !== undefined ? {
        planningDetails: nyeDetaljer === null ? Prisma.DbNull : nyeDetaljer,
      } : {}),
    };
    // Metadata fra gamle klienter må ikke overskrive en syklus koblet på siden sist.
    let row: Awaited<ReturnType<typeof prisma.weekPlan.findUnique>>;
    if (data.planningDetails !== undefined && existing) {
      const changed = await prisma.weekPlan.updateMany({ where: { ...key, updatedAt: existing.updatedAt }, data: felter });
      if (changed.count !== 1) return { ok: false, error: "Ukeplanen er endret. Last inn på nytt før du lagrer." };
      row = await prisma.weekPlan.findUnique({ where: { playerId_isoYear_weekNumber: key } });
    } else if (data.planningDetails !== undefined) {
      row = await prisma.weekPlan.create({ data: { ...key, ...felter, weekType: data.weekType ?? "UTVIKLING", notes: data.notes ?? [] } });
    } else row = await prisma.weekPlan.upsert({
      where: { playerId_isoYear_weekNumber: key },
      create: { ...key, ...felter, weekType: data.weekType ?? "UTVIKLING", notes: data.notes ?? [] },
      update: felter,
    });
    const mapped = parseWeekPlanData(row);
    if (!mapped) return { ok: false, error: "Ukeplanen kunne ikke gjenleses. Last inn på nytt før neste endring." };
    revalider(data.playerId);
    revalidatePath("/portal/planlegge/workbench");
    return { ok: true, data: mapped };
  } catch {
    return { ok: false, error: "Kunne ikke lagre ukeplanen. Prøv igjen." };
  }
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
  sessionId?: string;
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
      isTemplate: false,
      hiddenByPlayer: false,
      needsPlayerApproval: false,
    },
    include: { drills: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });
  const eligible = rows.filter((row) => row.approvalStatus !== "REJECTED" &&
    !(row.groupId && !row.sourceGroupSessionId && /^wb-group-[a-f0-9]{64}$/.test(row.id)));
  const selected = params.sessionId ? eligible.find(row => row.id === params.sessionId) : null;
  if (params.sessionId && !selected) return { ok: false, error: "Den valgte økten er ikke tilgjengelig for gjennomføring i dette tidsrommet." };
  const currentRow = selected?.status === "IN_PROGRESS" ? selected : eligible.find((row) => row.status === "IN_PROGRESS") ?? null;
  const published = eligible.filter((row) => row.status === "PUBLISHED");
  const currentKey = currentRow ? `${fraDatoKolonne(currentRow.date)}:${String(currentRow.startMinute).padStart(4, "0")}` : "";
  const nextRow = selected?.status === "PUBLISHED" ? selected : currentRow
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
      ...(erSpillerenSelv ? { hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] } : {}),
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
    weeklyVolMin: b.weeklyVolMin,
    weeklyVolMax: b.weeklyVolMax,
    sessionBudget: parseSessionBudget(b.weeklySessionBudget),
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
    weeklyVolMin: block.weeklyVolMin,
    weeklyVolMax: block.weeklyVolMax,
    sessionBudget: parseSessionBudget(block.weeklySessionBudget),
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
      where: await bankOvelseWhere(viewer, params.playerId),
      orderBy: { name: "asc" },
      take: 60,
    }),
    prisma.workbenchSession.findMany({
      where: { playerId: params.playerId, isTemplate: true,
        ...(viewer.id === params.playerId ? { hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] } : {}) },
      include: { drills: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.workbenchSession.findMany({
      where: { playerId: params.playerId, date: { gte: forrigeFra, lte: forrigeTil },
        ...(viewer.id === params.playerId ? { hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] } : {}) },
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
  if (!viewer || !["PLAYER", "COACH", "ADMIN"].includes(viewer.role)) return { ok: false, error: INGEN_TILGANG };
  for (const drill of cmd.drills ?? []) {
    const ref = await hentBankReferanser(drill, viewer, cmd.playerId);
    if (!ref.ok) return ref;
    Object.assign(drill, ref.data);
  }

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
    rationale: cmd.rationale,
    location: cmd.location,
    maalsetning: cmd.maalsetning,
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
  if (!viewer || !["PLAYER", "COACH", "ADMIN"].includes(viewer.role)) return { ok: false, error: INGEN_TILGANG };
  for (const drill of cmd.drills ?? []) {
    const ref = await hentBankReferanser(drill, viewer, cmd.playerId);
    if (!ref.ok) return ref;
    Object.assign(drill, ref.data);
  }

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
      rationale: cmd.rationale,
      location: cmd.location,
      maalsetning: cmd.maalsetning,
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
  if (!viewer || !["PLAYER", "COACH", "ADMIN"].includes(viewer.role)) return { ok: false, error: INGEN_TILGANG };

  const kilde = parseSourceId(parsed.data.sourceId);
  if (!kilde) return { ok: false, error: "Ukjent kilde." };

  const erCoach = viewer.id !== parsed.data.playerId;
  let utkast: WorkbenchSession;
  let kopiertOktinnhold: Pick<WbRow, "practiceType" | "pressureLevel" | "pPosisjoner" | "skillArea"> | undefined;
  let kopierteDriller: WbRow["drills"] | undefined;

  if (kilde.kind === "DRILL") {
    const rad = await lastBankOvelse(kilde.exerciseId, viewer, parsed.data.playerId);
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
    const task = await lastBankOppgave(kilde.taskId, parsed.data.playerId);
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
      positionTaskId: task.id,
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
    if (!rad || rad.playerId !== parsed.data.playerId || (viewer.id === rad.playerId && !canReadOwnGroupCopy(rad))) {
      return { ok: false, error: "Fant ikke kilden." };
    }
    const kildeOkt = mapSession(rad);
    kopierteDriller = rad.drills;
    kopiertOktinnhold = { practiceType: rad.practiceType, pressureLevel: rad.pressureLevel, pPosisjoner: rad.pPosisjoner, skillArea: rad.skillArea };

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
      rationale: kildeOkt.rationale,
      location: kildeOkt.location,
      maalsetning: kildeOkt.maalsetning,
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
    data: {
      ...sessionOpprettelseData(utkast),
      ...kopiertOktinnhold,
      ...(kopierteDriller ? { drills: { create: [...kopierteDriller].sort((a, b) => a.sortOrder - b.sortOrder).map((d, sortOrder) => ({
        // Kopien får egne ID-er; planinnhold og kilde/dose beholdes fra rå lagring.
        title: d.title, description: d.description, durationMinutes: d.durationMinutes,
        akFormel: d.akFormel === null ? Prisma.JsonNull : d.akFormel,
        techniqueFocus: d.techniqueFocus, sourceId: d.sourceId, sortOrder,
        exerciseId: d.exerciseId, positionTaskId: d.positionTaskId,
        repType: d.repType, repAntall: d.repAntall, repMinutter: d.repMinutter, repSett: d.repSett, repReps: d.repReps,
        planRepsUtenBall: d.planRepsUtenBall, planRepsLavFart: d.planRepsLavFart, planRepsAuto: d.planRepsAuto,
      })) } } : {}),
    },
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
  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const kilde = parseSourceId(parsed.data.sourceId);
  if (!kilde || (kilde.kind !== "DRILL" && kilde.kind !== "TEK")) {
    return { ok: false, error: "Kun øvelser og tekniske oppgaver kan dras inn på en eksisterende økt." };
  }

  let drill: Omit<Drill, "id" | "order"> | undefined;

  if (kilde.kind === "DRILL") {
    const rad = await lastBankOvelse(kilde.exerciseId, treff.viewer, treff.row.playerId);
    if (!rad) return { ok: false, error: "Fant ikke øvelsen." };
    drill = exerciseToSourceItem(rad).drill;
    if (!drill) return { ok: false, error: "Fant ikke øvelsen." };
  } else if (kilde.kind === "TEK") {
    const task = await lastBankOppgave(kilde.taskId, treff.row.playerId);
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
      positionTaskId: task.id,
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
    where: { id: parsed.data.sessionId, updatedAt: treff.row.updatedAt },
    data: {
      date: tilDatoKolonne(flyttet.date),
      startMinute: flyttet.startMinute,
      durationMinutes: flyttet.durationMinutes,
      ...(treff.row.sourceGroupSessionId ? { localOverride: true } : {}),
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
        if (treff.row.groupId && treff.row.origin === "GROUP" && !treff.row.sourceGroupSessionId && treff.row.id.startsWith("wb-group-")) throw new Error("Bruk gruppepublisering.");
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

  if (treff.row.groupId && treff.row.origin === "GROUP" && !treff.row.sourceGroupSessionId && treff.row.id.startsWith("wb-group-")) {
    return { ok: false, error: "Bruk tilbaketrekking for gruppen." };
  }
  if (treff.row.status === "DRAFT") return { ok: true, data: mapSession(treff.row) };
  if (treff.row.status !== "PUBLISHED") return { ok: false, error: "Bare publiserte økter kan trekkes tilbake." };
  const neste = unpublishSessionPure(mapSession(treff.row));
  await prisma.workbenchSession.update({
    where: { id: sessionId, updatedAt: treff.row.updatedAt },
    data: { status: neste.status, publishedAt: null, publishedBy: null,
      ...(treff.row.sourceGroupSessionId ? { localOverride: true } : {}) },
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
  const ref = await hentBankReferanser(parsed.data, treff.viewer, treff.row.playerId);
  if (!ref.ok) return ref;
  Object.assign(parsed.data, ref.data);

  const neste = addDrillPure(mapSession(treff.row), {
    sessionId: input.sessionId,
    drill: parsed.data,
    atIndex: input.atIndex,
  });

  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.workbenchSession.updateMany({
        where: { id: input.sessionId, updatedAt: treff.row.updatedAt },
        data: { durationMinutes: neste.durationMinutes,
          ...(treff.row.sourceGroupSessionId ? { localOverride: true } : {}) },
      });
      if (locked.count !== 1) throw new DrillSamtidigEndring();
      for (const d of neste.drills) {
        // Ingen gjenoppretting: identitet, dose, historikk og kildekoblinger beholdes.
        if (treff.row.drills.some(existing => existing.id === d.id)) {
          await tx.workbenchDrill.update({ where: { id: d.id, sessionId: input.sessionId }, data: { sortOrder: d.order } });
        } else {
          await tx.workbenchDrill.create({ data: { id: d.id, sessionId: input.sessionId,
            title: d.title, description: d.description ?? null, durationMinutes: d.durationMinutes,
            akFormel: akFormelTilJson(d.akFormel), techniqueFocus: d.techniqueFocus ?? null,
            sourceId: d.sourceId ?? null, exerciseId: d.exerciseId ?? null, positionTaskId: d.positionTaskId ?? null, sortOrder: d.order } });
        }
      }
    });
  } catch (error) {
    if (error instanceof DrillSamtidigEndring) return { ok: false, error: "Økten er endret. Last inn på nytt og prøv igjen." };
    throw error;
  }

  return lagreOgHent(input.sessionId);
}

/** Rediger én øvelse med stabil identitet. Undefined beholder, null tømmer tekstfelt. */
export async function updateDrill(input: UpdateDrillInput): Promise<WbResultat<WorkbenchSession>> {
  const parsed = UpdateDrillSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig øvelse." };
  const cmd = parsed.data;
  const treff = await hentMedTilgang(cmd.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  const drill = treff.row.drills.find(d => d.id === cmd.drillId);
  if (!drill) return { ok: false, error: "Fant ikke øvelsen i økten." };
  if (cmd.expectedUpdatedAt && cmd.expectedUpdatedAt !== treff.row.updatedAt.toISOString()) {
    return { ok: false, error: "Økten er endret. Last inn på nytt og prøv igjen." };
  }
  const patch = cmd.patch;
  if (patch.akFormel && !gyldigFormelEndring(drill.akFormel, patch.akFormel)) return { ok: false, error: "Ugyldig ny RIR eller øvelsesformel." };
  const duration = patch.durationMinutes ?? drill.durationMinutes;
  const total = treff.row.drills.reduce((sum, d) => sum + (d.id === drill.id ? duration : d.durationMinutes), 0);
  try {
    await prisma.$transaction(async tx => {
      const locked = await tx.workbenchSession.updateMany({
        where: { id: cmd.sessionId, updatedAt: treff.row.updatedAt },
        data: { durationMinutes: Math.max(treff.row.durationMinutes, total),
          ...(treff.row.sourceGroupSessionId ? { localOverride: true } : {}) },
      });
      if (locked.count !== 1) throw new DrillSamtidigEndring();
      await tx.workbenchDrill.update({ where: { id: cmd.drillId, sessionId: cmd.sessionId }, data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.durationMinutes !== undefined ? { durationMinutes: patch.durationMinutes } : {}),
        ...(patch.techniqueFocus !== undefined ? { techniqueFocus: patch.techniqueFocus } : {}),
        ...(patch.akFormel !== undefined ? { akFormel: bevarHistoriskeDrillfelt(drill.akFormel, akFormelTilJson(patch.akFormel), FORMEL_FELT) } : {}),
      } });
    });
  } catch (error) {
    if (error instanceof DrillSamtidigEndring) return { ok: false, error: "Økten er endret. Last inn på nytt og prøv igjen." };
    throw error;
  }
  return lagreOgHent(cmd.sessionId);
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

  await prisma.$transaction([
    ...(treff.row.sourceGroupSessionId ? [prisma.workbenchSession.update({ where: { id: treff.row.id, updatedAt: treff.row.updatedAt }, data: { localOverride: true } })] : []),
    ...neste.drills.map((d) =>
      prisma.workbenchDrill.update({
        where: { id: d.id },
        data: { sortOrder: d.order },
      }),
    ),
  ]);

  return lagreOgHent(parsed.data.sessionId);
}

/** Fjern én øvelse og reindekser resten. */
export async function removeDrill(input: {
  sessionId: string;
  drillId: string;
}): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(input.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  if (harGjennomforingshistorikk(treff.row)) return { ok: false, error: "Øvelser med gjennomføringshistorikk kan ikke slettes som planutkast." };
  if (!treff.row.drills.some((d) => d.id === input.drillId)) {
    return { ok: false, error: "Fant ikke øvelsen i denne økten." };
  }

  const beholdt = treff.row.drills
    .filter((d) => d.id !== input.drillId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  try {
    await prisma.$transaction(async tx => {
      const locked = await tx.workbenchSession.updateMany({
        where: { id: treff.row.id, playerId: treff.row.playerId, status: treff.row.status, updatedAt: treff.row.updatedAt,
          liveSnapshot: { equals: Prisma.DbNull }, actualMinutes: null, perceivedEffort: null },
        data: { ...(treff.row.sourceGroupSessionId ? { localOverride: true } : { updatedAt: new Date() }) },
      });
      if (locked.count !== 1) throw new DrillSamtidigEndring();
      await tx.workbenchDrill.delete({ where: { id: input.drillId, sessionId: treff.row.id } });
      for (const [i, drill] of beholdt.entries()) await tx.workbenchDrill.update({ where: { id: drill.id }, data: { sortOrder: i } });
    });
  } catch { return { ok: false, error: "Økten ble endret samtidig. Ingen øvelser er fjernet." }; }

  return lagreOgHent(input.sessionId);
}

/** Slett økten. Øvelsene følger med (ON DELETE CASCADE). */
export async function deleteSession(
  sessionId: string,
): Promise<WbResultat<null>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  if (treff.row.groupId && !treff.row.sourceGroupSessionId && /^wb-group-[a-f0-9]{64}$/.test(treff.row.id)) {
    return { ok: false, error: "Trekk tilbake gruppeøkten fra gruppeplanen." };
  }
  if (harGjennomforingshistorikk(treff.row)) return { ok: false, error: "Økten har gjennomføringshistorikk og kan ikke slettes som et planutkast." };
  try {
    const where = { id: sessionId, playerId: treff.row.playerId, status: treff.row.status, updatedAt: treff.row.updatedAt,
      liveSnapshot: { equals: Prisma.DbNull }, actualMinutes: null, perceivedEffort: null };
    if (treff.row.sourceGroupSessionId) {
      // Et fravalg må ikke gjenopprettes ved neste gruppepublisering.
      const hidden = await prisma.workbenchSession.updateMany({ where, data: { hiddenByPlayer: true, localOverride: true } });
      if (hidden.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Ingen endring ble lagret." };
    } else {
      const removed = await prisma.workbenchSession.deleteMany({ where });
      if (removed.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Ingen økt ble slettet." };
    }
  } catch { return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du prøver igjen." }; }
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
    where: { seriesId: gjeldende.seriesId, playerId: gjeldende.playerId },
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
    notes?: string | null;
    rationale?: string | null;
    location?: string | null;
    maalsetning?: string | null;
  };
  expectedUpdatedAt?: string;
  policy: RecurrencePolicy;
}): Promise<WbResultat<WorkbenchSession[]>> {
  const parsed = UpdateSeriesSessionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig endring." };
  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  if (!["PLAYER", "COACH", "ADMIN"].includes(treff.viewer.role)) return { ok: false, error: INGEN_TILGANG };
  if (["rationale", "location", "maalsetning"].some(key => Object.hasOwn(parsed.data.patch, key)) && !parsed.data.expectedUpdatedAt) {
    return { ok: false, error: "Last inn økten på nytt før du endrer innholdet." };
  }
  if (parsed.data.expectedUpdatedAt && parsed.data.expectedUpdatedAt !== treff.row.updatedAt.toISOString()) {
    return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du fortsetter." };
  }
  const rammer = await serieMalRammer(mapSession(treff.row), parsed.data.policy);
  if (rammer.length === 0) return { ok: false, error: "Fant ikke økten i serien. Last inn på nytt." };
  const patch = parsed.data.patch;
  const data = {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.pyramid !== undefined ? { pyramid: patch.pyramid } : {}),
    ...(patch.blockType !== undefined ? { blockType: patch.blockType } : {}),
    ...(patch.environment !== undefined ? { environment: patch.environment } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes || null } : {}),
    ...(patch.rationale !== undefined ? { rationale: patch.rationale || null } : {}),
    ...(patch.location !== undefined ? { location: patch.location || null } : {}),
    ...(patch.maalsetning !== undefined ? { maalsetning: patch.maalsetning || null } : {}),
  };
  try {
    const rows = await prisma.$transaction(async tx => {
      // Ingen delvis serieoppdatering. Hver forekomst beholder dato, dose og øvrig innhold.
      const owned = [];
      for (const session of rammer) {
        const check = await hentMedTilgang(session.id, tx);
        if ("feil" in check || check.row.playerId !== treff.row.playerId) throw new DrillSamtidigEndring();
        if (check.row.updatedAt.toISOString() !== session.updatedAt) throw new DrillSamtidigEndring();
        owned.push(check.row);
      }
      const updated = [];
      for (const row of owned) {
        const result = await tx.workbenchSession.updateMany({
          where: { id: row.id, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt },
          data: { ...data, ...(row.sourceGroupSessionId ? { localOverride: true } : {}) },
        });
        if (result.count !== 1) throw new DrillSamtidigEndring();
        updated.push(await tx.workbenchSession.findUniqueOrThrow({ where: { id: row.id }, include: { drills: true } }));
      }
      return updated;
    });
    revalider(treff.row.playerId);
    return { ok: true, data: rows.map(mapSession) };
  } catch {
    return { ok: false, error: "Økten ble endret samtidig eller kunne ikke lagres. Last inn på nytt og prøv igjen." };
  }
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

  try {
    await prisma.$transaction(async tx => {
      const rows = [];
      for (const s of rammer) {
        const access = await hentMedTilgang(s.id, tx);
        if ("feil" in access || access.row.playerId !== gjeldende.playerId || access.row.updatedAt.toISOString() !== s.updatedAt || harGjennomforingshistorikk(access.row)) throw new DrillSamtidigEndring();
        rows.push(access.row);
      }
      for (const row of rows) {
        const where = { id: row.id, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt,
          liveSnapshot: { equals: Prisma.DbNull }, actualMinutes: null, perceivedEffort: null };
        if (row.sourceGroupSessionId) {
          await tx.workbenchSession.update({ where, data: { hiddenByPlayer: true, localOverride: true } });
        } else await tx.workbenchSession.delete({ where });
      }
    });
  } catch { return { ok: false, error: "Serien er endret eller inneholder gjennomføringshistorikk. Ingen økter er fjernet." }; }
  revalider(gjeldende.playerId);
  return { ok: true, data: { slettet: rammer.length } };
}

/** Lagre/fjern en økt som mal — dukker opp i kildepanelet under «Maler». */
export async function setSessionTemplate(
  sessionId: string,
  isTemplate: boolean,
): Promise<WbResultat<WorkbenchSession>> {
  const parsed = z.object({ sessionId: z.string().min(1), isTemplate: z.boolean() }).safeParse({ sessionId, isTemplate });
  if (!parsed.success) return { ok: false, error: "Ugyldig malvalg." };
  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  const row = treff.row;
  if (parsed.data.isTemplate && row.status === "IN_PROGRESS") {
    return { ok: false, error: "En pågående økt kan ikke lagres som mal. Fullfør økten først." };
  }

  // Start og malvalg konkurrerer om samme versjon; originalen må aldri låses midt i gjennomføring.
  const result = await prisma.workbenchSession.updateMany({
    where: { id: row.id, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt },
    data: { isTemplate: parsed.data.isTemplate },
  });
  if (result.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du fortsetter." };
  return lagreOgHent(row.id);
}

// ─── Gjennomføring ──────────────────────────────────────────────────────────

async function settStatus(
  sessionId: string,
  status: "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const row = treff.row;
  if (row.isTemplate) return { ok: false, error: "Plasser en kopi av malen i planen før gjennomføring." };
  if (row.groupId && row.origin === "GROUP" && !row.sourceGroupSessionId && row.id.startsWith("wb-group-")) {
    return { ok: false, error: "Gjennomføringen registreres på spillerens økt." };
  }
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
  if (liveSnapshot) Object.assign(liveSnapshot, { execution: initialSessionExecution(liveSnapshot.startedAtISO) });
  const result = await prisma.workbenchSession.updateMany({
    where: { id: sessionId, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt, isTemplate: false,
      hiddenByPlayer: false, needsPlayerApproval: false },
    data: {
      status,
      ...(liveSnapshot ? { liveSnapshot: liveSnapshot as unknown as Prisma.InputJsonValue } : {}),
      ...(status !== "IN_PROGRESS" ? { liveSnapshot: sealSessionSnapshot(row.liveSnapshot, status, new Date().toISOString()) as Prisma.InputJsonValue } : {}),
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

const UpdateSessionEffortSchema = z.object({
  sessionId: z.string().min(1),
  perceivedEffort: z.number().int().min(1).max(10).nullable().optional(),
  actualMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  reason: z.string().trim().min(1).max(500).optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
  requestId: z.string().min(8).max(100).optional(),
});

export type UpdateSessionEffortInput = z.infer<typeof UpdateSessionEffortSchema>;

/**
 * Oppdaterer opplevd anstrengelse (sRPE 1–10) og faktisk tidsbruk på en økt.
 * Tilgjengelig for både spiller og coach.
 */
export async function updateSessionEffort(
  input: UpdateSessionEffortInput
): Promise<WbResultat<WorkbenchSession>> {
  const parsed = UpdateSessionEffortSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldige verdier for anstrengelse eller tid." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };
  const row = treff.row;
  if (["COMPLETED", "ABANDONED", "SKIPPED"].includes(row.status)) {
    if (!parsed.data.reason || !parsed.data.expectedUpdatedAt || !parsed.data.requestId) return { ok: false, error: "Bruk etterregistrering med årsak for å rette gjennomføringen." };
    return mutateSessionExecution({ ...parsed.data, action: "RECORD", outcome: row.status });
  }
  if (row.isTemplate || row.hiddenByPlayer || row.needsPlayerApproval || row.approvalStatus === "REJECTED" || !["PUBLISHED", "IN_PROGRESS"].includes(row.status)) return { ok: false, error: "Økten kan ikke registreres fra denne statusen." };
  if (parsed.data.expectedUpdatedAt && parsed.data.expectedUpdatedAt !== row.updatedAt.toISOString()) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt." };
  const start = osloInstant(row.date.getUTCFullYear(), row.date.getUTCMonth() + 1, row.date.getUTCDate(), Math.floor(row.startMinute / 60), row.startMinute % 60);
  if (parsed.data.actualMinutes !== undefined && start > new Date()) return { ok: false, error: "En fremtidig økt kan ikke etterregistreres." };
  const updated = await prisma.workbenchSession.updateMany({
    where: { id: row.id, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt, isTemplate: false, hiddenByPlayer: false, needsPlayerApproval: false },
    data: {
      perceivedEffort: parsed.data.perceivedEffort,
      actualMinutes: parsed.data.actualMinutes,
    },
  });
  if (updated.count !== 1) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt." };
  return lagreOgHent(row.id);
}

/**
 * Fullfører økten og lagrer samtidig opplevd anstrengelse (sRPE) og faktisk tid.
 */
export async function completeSessionWithEffort(
  input: UpdateSessionEffortInput
): Promise<WbResultat<WorkbenchSession>> {
  const parsed = UpdateSessionEffortSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldige verdier for anstrengelse eller tid." };
  }

  const treff = await hentMedTilgang(parsed.data.sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  const row = treff.row;
  if (row.isTemplate) return { ok: false, error: "Plasser en kopi av malen i planen før gjennomføring." };
  if (row.groupId && row.origin === "GROUP" && !row.sourceGroupSessionId && row.id.startsWith("wb-group-")) {
    return { ok: false, error: "Gjennomføringen registreres på spillerens økt." };
  }
  if (row.hiddenByPlayer || row.needsPlayerApproval || row.approvalStatus === "REJECTED") {
    return { ok: false, error: "Økten må være synlig og godkjent før gjennomføring." };
  }
  // Same lifecycle as completeSession: retries do not rewrite history.
  if (row.status === "COMPLETED") return { ok: true, data: mapSession(row) };
  if (!["PUBLISHED", "IN_PROGRESS"].includes(row.status)) {
    return { ok: false, error: "Økten kan ikke endres fra denne statusen." };
  }
  const result = await prisma.workbenchSession.updateMany({
    where: {
      id: row.id, playerId: row.playerId, status: row.status, updatedAt: row.updatedAt, isTemplate: false,
      hiddenByPlayer: false, needsPlayerApproval: false,
    },
    data: {
      status: "COMPLETED",
      perceivedEffort: parsed.data.perceivedEffort,
      actualMinutes: parsed.data.actualMinutes,
      liveSnapshot: sealSessionSnapshot(row.liveSnapshot, "COMPLETED", new Date().toISOString()) as Prisma.InputJsonValue,
    },
  });
  if (result.count !== 1) {
    return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du fortsetter." };
  }
  return lagreOgHent(row.id);
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
  if (current.isTemplate || next.isTemplate) return { ok: false, error: "Plasser en kopi av malen i planen før gjennomføring." };
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

  Object.assign(nextSnapshot, { execution: initialSessionExecution(nextSnapshot.startedAtISO) });
  try {
    await prisma.$transaction(async (tx) => {
      const completed = await tx.workbenchSession.updateMany({
        where: { id: current.id, playerId: current.playerId, status: "IN_PROGRESS", updatedAt: current.updatedAt, isTemplate: false },
        data: { status: "COMPLETED", liveSnapshot: sealSessionSnapshot(current.liveSnapshot, "COMPLETED", new Date().toISOString()) as Prisma.InputJsonValue },
      });
      const started = await tx.workbenchSession.updateMany({
        where: {
          id: next.id,
          playerId: next.playerId,
          status: "PUBLISHED",
          updatedAt: next.updatedAt,
          isTemplate: false,
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

  if (parsed.data.expectedUpdatedAt && parsed.data.expectedUpdatedAt !== row.updatedAt.toISOString()) return { ok: false, error: "Økten ble endret samtidig. Last inn på nytt før du fortsetter." };
  const raw = row.liveSnapshot == null ? {} : jsonObject(row.liveSnapshot);
  if (!raw || (raw.execution !== undefined && !readSessionExecution(raw))) return { ok: false, error: "Ukjente gjennomføringsdata er bevart og kan ikke overskrives." };
  const execution = readSessionExecution(raw);
  if (execution && execution.phase !== "ACTIVE") return { ok: false, error: "Fortsett økten før du endrer live-data." };
  const current = parseWorkbenchLiveSnapshot(row.liveSnapshot, expectedIds, row.updatedAt.toISOString());
  const updatedAtISO = new Date().toISOString();
  const snapshot = {
    ...raw,
    startedAtISO: current.startedAtISO,
    totalSec: parsed.data.totalSec,
    updatedAtISO,
    drills: expectedIds.map((id) => ({ ...jsonObject((Array.isArray(raw.drills) ? raw.drills : []).find(d => jsonObject(d)?.drillId === id)), ...incoming.get(id)! })),
    seriesTargets: { ...jsonObject(raw.seriesTargets), ...Object.fromEntries(expectedIds.map((id) => [id, parsed.data.seriesTargets[id] ?? 3])) },
  };
  const result = await prisma.workbenchSession.updateMany({
    where: { id: row.id, playerId: row.playerId, status: "IN_PROGRESS", updatedAt: row.updatedAt },
    data: { liveSnapshot: snapshot as Prisma.InputJsonValue, updatedAt: new Date(updatedAtISO) },
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
