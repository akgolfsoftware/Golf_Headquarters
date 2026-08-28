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
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { loadStallen } from "@/lib/admin/stallen-data";
import {
  addDays,
  addDrill as addDrillPure,
  applySeriesPatch,
  buildMonthViewModel,
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
  RecurrencePolicy,
  MonthViewModel,
  SourceItem,
  WeekViewModel,
  WorkbenchMode,
  WorkbenchSession,
  YearViewModel,
} from "@/lib/domain/workbench/types";
import { UI } from "@/lib/domain/workbench/labels";
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
  type WbRow,
} from "@/lib/workbench/wb-map";
import {
  exerciseToSourceItem,
  parseSourceId,
  previousWeekToSourceItem,
  templateToSourceItem,
} from "@/lib/workbench/sources-map";

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
): Promise<{ row: WbRow; viewer: Viewer } | { feil: string }> {
  const row = await prisma.workbenchSession.findUnique({
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
 * Låste blokker (skole, booking) er tomme i Loop 1; de kobles på i Loop 2.
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

  const vm = buildWeekViewModel(
    weekStart.data,
    rows.map(mapSession),
    [],
    params.mode,
    params.targetMinutes ?? 0,
  );
  return { ok: true, data: vm };
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
  return {
    ok: true,
    data: buildMonthViewModel(
      monthStart,
      sessions,
      params.mode,
      params.targetMinutes ?? 0,
      label,
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

  const sessions = await lastOkterIVindu(
    params.playerId,
    `${params.year}-01-01`,
    `${params.year}-12-31`,
    viewer.id,
  );
  return {
    ok: true,
    data: buildYearViewModel(
      params.year,
      sessions,
      params.mode,
      params.targetMinutes ?? 0,
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

  const [ovelser, maler, forrigeUke] = await Promise.all([
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
  ]);

  const data: SourceItem[] = [
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
    sessions.find((s) => s.status !== "COMPLETED" && !s.needsPlayerApproval)?.id ??
    sessions[0]?.id ??
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
  if (!row || row.playerId !== user.id) return { ok: true, data: null };

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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldige felter." };
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldige felter." };
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig kilde." };
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

/** Dra en øvelse fra kildepanelet rett inn i en eksisterende økt. */
export async function addDrillFromSource(input: {
  sessionId: string;
  sourceId: string;
}): Promise<WbResultat<WorkbenchSession>> {
  const parsed = AddDrillFromSourceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig kilde." };
  }

  const kilde = parseSourceId(parsed.data.sourceId);
  if (!kilde || kilde.kind !== "DRILL") {
    return { ok: false, error: "Kun øvelser kan dras inn på en eksisterende økt." };
  }

  const rad = await prisma.exerciseDefinition.findUnique({ where: { id: kilde.exerciseId } });
  if (!rad) return { ok: false, error: "Fant ikke øvelsen." };
  const drill = exerciseToSourceItem(rad).drill;
  if (!drill) return { ok: false, error: "Fant ikke øvelsen." };

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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig flytting." };
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

  const publiserte: WorkbenchSession[] = [];
  for (const id of sessionIds) {
    const treff = await hentMedTilgang(id);
    if ("feil" in treff) return { ok: false, error: treff.feil };

    let neste: WorkbenchSession;
    try {
      neste = publishSessionPure(mapSession(treff.row), {
        sessionId: id,
        publishedBy: treff.viewer.id,
      });
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Kunne ikke publisere økten.",
      };
    }

    const rad = await prisma.workbenchSession.update({
      where: { id },
      data: {
        status: neste.status,
        publishedAt: neste.publishedAt ? new Date(neste.publishedAt) : null,
        publishedBy: neste.publishedBy ?? null,
      },
      include: { drills: true },
    });
    publiserte.push(mapSession(rad));
    revalider(rad.playerId);
  }

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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig øvelse." };
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig rekkefølge." };
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig endring." };
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig sletting." };
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
  kreverPublisert: boolean,
): Promise<WbResultat<WorkbenchSession>> {
  const treff = await hentMedTilgang(sessionId);
  if ("feil" in treff) return { ok: false, error: treff.feil };

  if (kreverPublisert && treff.row.status === "DRAFT") {
    return { ok: false, error: "Økten er ikke publisert ennå." };
  }

  await prisma.workbenchSession.update({
    where: { id: sessionId },
    data: { status },
  });
  return lagreOgHent(sessionId);
}

/** Start økten. Et utkast kan ikke startes — det finnes ikke for spilleren. */
export async function startSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "IN_PROGRESS", true);
}

export async function completeSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "COMPLETED", true);
}

export async function skipSession(
  sessionId: string,
): Promise<WbResultat<WorkbenchSession>> {
  return settStatus(sessionId, "SKIPPED", false);
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
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldige felter." };
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
