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
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { sanitizeAkFormel, type AkFormelInput } from "@/lib/workbench/ak-formel";

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
    },
    select: DRILL_SELECT,
  });
  revalidatePath("/admin/spillere/" + drill.session.plan.userId + "/workbench");
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true, drill: toWbDrill(updated) };
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
