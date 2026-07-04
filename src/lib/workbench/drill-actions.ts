"use server";

/**
 * Drill-CRUD for Workbench Økt-detalj (Del B — drill-nivå fordeling).
 *
 * On-demand: OktDetailTab laster en økts drills når fanen åpnes, og persisterer
 * opprett/rediger/slett herfra. Drills bor på kanon `SessionDrill` (B1). AK-formel
 * per drill arver øktas default client-side (B2) og renses server-side.
 *
 * Lesing: eieren (spiller) eller coach. Skriving: kun COACH/ADMIN (samme role-gate
 * som AK-formel-chips). Eierskap sjekkes via session.plan.userId.
 */

import { revalidatePath } from "next/cache";
import type { PyramidArea, RepType, SkillArea } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { sanitizeAkFormel, type AkFormelInput } from "@/lib/workbench/ak-formel";

// Rep-type + volum + område per drill (bølge 2/3). Validering client-strenger → enum/int.
const REP_TYPES = ["SVINGER_UTEN_BALL", "BALLER_SLATT", "TID", "SETT_REPS"] as const;
const PYRAMID = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
const SKILL = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"] as const;

const validRepType = (v: string | null | undefined): RepType | null =>
  v && (REP_TYPES as readonly string[]).includes(v) ? (v as RepType) : null;
const validPyramid = (v: string | null | undefined): PyramidArea | null =>
  v && (PYRAMID as readonly string[]).includes(v) ? (v as PyramidArea) : null;
const validSkill = (v: string | null | undefined): SkillArea | null =>
  v && (SKILL as readonly string[]).includes(v) ? (v as SkillArea) : null;
const validInt = (v: number | null | undefined): number | null =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null;

/** Rep-type + volum + område per drill (kanonisk kontrakt, bølge 2). */
export type DrillVolumInput = {
  repType?: string | null;
  repAntall?: number | null;
  repMinutter?: number | null;
  repSett?: number | null;
  repReps?: number | null;
  pyramidArea?: string | null;
  skillArea?: string | null;
};

/** DrillVolumInput → validert drill-data. Alle felt settes (create). */
function drillVolumData(v: DrillVolumInput) {
  return {
    repType: validRepType(v.repType),
    repAntall: validInt(v.repAntall),
    repMinutter: validInt(v.repMinutter),
    repSett: validInt(v.repSett),
    repReps: validInt(v.repReps),
    pyramidArea: validPyramid(v.pyramidArea),
    skillArea: validSkill(v.skillArea),
  };
}

/** Guardet patch (undefined = uendret, null/verdi = sett) — for update + bulk. */
function drillVolumPatch(v: DrillVolumInput) {
  return {
    ...(v.repType !== undefined ? { repType: validRepType(v.repType) } : {}),
    ...(v.repAntall !== undefined ? { repAntall: validInt(v.repAntall) } : {}),
    ...(v.repMinutter !== undefined ? { repMinutter: validInt(v.repMinutter) } : {}),
    ...(v.repSett !== undefined ? { repSett: validInt(v.repSett) } : {}),
    ...(v.repReps !== undefined ? { repReps: validInt(v.repReps) } : {}),
    ...(v.pyramidArea !== undefined ? { pyramidArea: validPyramid(v.pyramidArea) } : {}),
    ...(v.skillArea !== undefined ? { skillArea: validSkill(v.skillArea) } : {}),
  };
}

export type WbDrill = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number | null;
  sets: number | null;
  repsSets: string;
  csTarget: number | null;
  notes: string | null;
  orderIndex: number;
  // AK-formel per drill (løse strenger til klient — samme som inspektør-chipsene).
  lFase: string | null;
  miljo: string | null;
  csNivaa: string | null;
  prPress: string | null;
  pPosisjoner: string[];
  // Rep-type + volum + område per drill (bølge 2).
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
  pyramidArea: string | null;
  skillArea: string | null;
};

export type ExerciseHit = {
  id: string;
  name: string;
  pyramidArea: string;
  defaultRepsSets: string | null;
};

const DRILL_SELECT = {
  id: true,
  exerciseId: true,
  reps: true,
  sets: true,
  repsSets: true,
  csTarget: true,
  notes: true,
  orderIndex: true,
  lFase: true,
  miljo: true,
  csNivaa: true,
  prPress: true,
  pPosisjoner: true,
  repType: true,
  repAntall: true,
  repMinutter: true,
  repSett: true,
  repReps: true,
  pyramidArea: true,
  skillArea: true,
  exercise: { select: { name: true } },
} as const;

type DrillRow = {
  id: string;
  exerciseId: string;
  reps: number | null;
  sets: number | null;
  repsSets: string;
  csTarget: number | null;
  notes: string | null;
  orderIndex: number;
  lFase: string | null;
  miljo: string | null;
  csNivaa: string | null;
  prPress: string | null;
  pPosisjoner: string[];
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
  pyramidArea: string | null;
  skillArea: string | null;
  exercise: { name: string };
};

function toWbDrill(d: DrillRow): WbDrill {
  return {
    id: d.id,
    exerciseId: d.exerciseId,
    exerciseName: d.exercise.name,
    reps: d.reps,
    sets: d.sets,
    repsSets: d.repsSets,
    csTarget: d.csTarget,
    notes: d.notes,
    orderIndex: d.orderIndex,
    lFase: d.lFase,
    miljo: d.miljo,
    csNivaa: d.csNivaa,
    prPress: d.prPress,
    pPosisjoner: d.pPosisjoner,
    repType: d.repType,
    repAntall: d.repAntall,
    repMinutter: d.repMinutter,
    repSett: d.repSett,
    repReps: d.repReps,
    pyramidArea: d.pyramidArea,
    skillArea: d.skillArea,
  };
}

/** AK-formel-input → drill-data (PressureLevel-verdien skrives til prPress-kolonnen). */
function drillAkData(ak: AkFormelInput | undefined) {
  const s = sanitizeAkFormel(ak);
  return {
    lFase: s.lFase,
    miljo: s.miljo,
    csNivaa: s.csNivaa,
    prPress: s.pressureLevel, // PR1–PR5 identiske; PressureLevel-verdi → PRPress-kolonne
    pPosisjoner: s.pPosisjoner,
  };
}

/** Sjekk at innlogget bruker eier økta (spiller) eller er coach. */
async function sessionForAccess(sessionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, plan: { select: { userId: true } } },
  });
  if (!session) return { ok: false as const, error: "Økt ikke funnet" };
  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!isCoach && session.plan.userId !== user.id) {
    return { ok: false as const, error: "Ingen tilgang" };
  }
  return { ok: true as const, playerId: session.plan.userId, isCoach };
}

/** Last en økts drills (eier eller coach). */
export async function loadSessionDrills(sessionId: string): Promise<WbDrill[]> {
  const access = await sessionForAccess(sessionId);
  if (!access.ok) return [];
  const rows = await prisma.sessionDrill.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
    select: DRILL_SELECT,
  });
  return rows.map(toWbDrill);
}

/** Søk i øvelsesbiblioteket (for «Legg til øvelse»-velgeren). */
export async function searchExercises(query: string, pyramidArea?: string): Promise<ExerciseHit[]> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const q = query.trim();
  const rows = await prisma.exerciseDefinition.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(pyramidArea && ["FYS", "TEK", "SLAG", "SPILL", "TURN"].includes(pyramidArea)
        ? { pyramidArea: pyramidArea as "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 24,
    select: { id: true, name: true, pyramidArea: true, defaultRepsSets: true },
  });
  return rows.map((r) => ({ id: r.id, name: r.name, pyramidArea: r.pyramidArea, defaultRepsSets: r.defaultRepsSets }));
}

/** Opprett en drill på en økt (coach). AK-formel arves fra økta client-side. */
export async function createSessionDrill(input: {
  sessionId: string;
  exerciseId: string;
  reps?: number | null;
  sets?: number | null;
  repsSets?: string;
  csTarget?: number | null;
  akFormel?: AkFormelInput;
  volum?: DrillVolumInput;
}): Promise<{ ok: boolean; drill?: WbDrill; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const access = await sessionForAccess(input.sessionId);
  if (!access.ok) return { ok: false, error: access.error };

  const exercise = await prisma.exerciseDefinition.findUnique({
    where: { id: input.exerciseId },
    select: { id: true, defaultRepsSets: true },
  });
  if (!exercise) return { ok: false, error: "Øvelse ikke funnet" };

  const maxOrder = await prisma.sessionDrill.aggregate({
    where: { sessionId: input.sessionId },
    _max: { orderIndex: true },
  });
  const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;

  const created = await prisma.sessionDrill.create({
    data: {
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      repsSets: (input.repsSets ?? exercise.defaultRepsSets ?? "1×1").slice(0, 60),
      reps: input.reps ?? null,
      sets: input.sets ?? null,
      csTarget: input.csTarget ?? null,
      orderIndex,
      ...drillAkData(input.akFormel),
      ...(input.volum ? drillVolumData(input.volum) : {}),
    },
    select: DRILL_SELECT,
  });
  revalidatePath("/admin/spillere/" + access.playerId + "/workbench");
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, drill: toWbDrill(created) };
}

/** Rediger reps/sett/csTarget/AK-formel på en drill (coach). */
export async function updateSessionDrill(
  drillId: string,
  patch: {
    reps?: number | null;
    sets?: number | null;
    repsSets?: string;
    csTarget?: number | null;
    notes?: string | null;
    akFormel?: AkFormelInput;
    volum?: DrillVolumInput;
  },
): Promise<{ ok: boolean; drill?: WbDrill; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const drill = await prisma.sessionDrill.findUnique({
    where: { id: drillId },
    select: { id: true, session: { select: { id: true, plan: { select: { userId: true } } } } },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  const updated = await prisma.sessionDrill.update({
    where: { id: drillId },
    data: {
      ...(patch.reps !== undefined ? { reps: patch.reps } : {}),
      ...(patch.sets !== undefined ? { sets: patch.sets } : {}),
      ...(patch.repsSets !== undefined ? { repsSets: patch.repsSets.slice(0, 60) } : {}),
      ...(patch.csTarget !== undefined ? { csTarget: patch.csTarget } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.akFormel ? drillAkData(patch.akFormel) : {}),
      ...(patch.volum ? drillVolumPatch(patch.volum) : {}),
    },
    select: DRILL_SELECT,
  });
  revalidatePath("/admin/spillere/" + drill.session.plan.userId + "/workbench");
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, drill: toWbDrill(updated) };
}

/**
 * «Sett samme for hele økten» (bølge 3) — bulk-apply rep-type/volum (+ ev. AK-formel)
 * til ALLE drills i en økt. Modellen lagrer per drill; dette er kun en effektiv
 * skrive-affordance for coach. Returnerer de oppdaterte drillene.
 */
export async function updateAllDrillsInSession(
  sessionId: string,
  patch: { akFormel?: AkFormelInput; volum?: DrillVolumInput },
): Promise<{ ok: boolean; drills?: WbDrill[]; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const access = await sessionForAccess(sessionId);
  if (!access.ok) return { ok: false, error: access.error };

  const data = {
    ...(patch.akFormel ? drillAkData(patch.akFormel) : {}),
    ...(patch.volum ? drillVolumPatch(patch.volum) : {}),
  };
  if (Object.keys(data).length === 0) return { ok: false, error: "Ingenting å sette" };

  await prisma.sessionDrill.updateMany({ where: { sessionId }, data });
  const rows = await prisma.sessionDrill.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
    select: DRILL_SELECT,
  });
  revalidatePath("/admin/spillere/" + access.playerId + "/workbench");
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, drills: rows.map(toWbDrill) };
}

/** Slett en drill (coach). */
export async function deleteSessionDrill(drillId: string): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const drill = await prisma.sessionDrill.findUnique({
    where: { id: drillId },
    select: { id: true, session: { select: { plan: { select: { userId: true } } } } },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };
  await prisma.sessionDrill.delete({ where: { id: drillId } });
  revalidatePath("/admin/spillere/" + drill.session.plan.userId + "/workbench");
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}
