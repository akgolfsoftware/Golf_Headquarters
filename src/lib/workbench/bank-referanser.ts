import "server-only";
import type { ExerciseDefinition, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { parseSourceId } from "./sources-map";

type Viewer = { id: string; role: string };
type Db = Pick<Prisma.TransactionClient, "exerciseDefinition" | "positionTask">;
type Ref = { sourceId?: string; exerciseId?: string; positionTaskId?: string };
const avvist = { ok: false as const, error: "Kilden er ikke tilgjengelig for denne planen." };

export async function bankOvelseWhere(viewer: Viewer, playerId: string): Promise<Prisma.ExerciseDefinitionWhereInput> {
  // Portalbanken deler også PRIVATE fra en aktiv enrollment-coach.
  const enrollments = await prisma.playerEnrollment.findMany({ where: { userId: playerId, endedAt: null, coachId: { not: null } }, select: { coachId: true } });
  const enrollmentCoaches = enrollments.map(e => e.coachId).filter((id): id is string => id !== null);
  const candidates = await prisma.exerciseDefinition.findMany({ where: { source: "COACH", visibility: "COACH_PLAYERS", createdBy: { not: null } },
    select: { createdBy: true }, distinct: ["createdBy"] });
  const allowed: string[] = [];
  for (let i = 0; i < candidates.length; i += 4) {
    const checked = await Promise.all(candidates.slice(i, i + 4).map(async c => c.createdBy &&
      await harCoachTilgangTilSpiller({ id: c.createdBy, role: "COACH" }, playerId) ? c.createdBy : null));
    allowed.push(...checked.filter((id): id is string => id !== null));
  }
  return { OR: [{ source: "SYSTEM" }, { createdBy: viewer.id }, { source: "COACH", visibility: "COACH_PLAYERS", createdBy: { in: allowed } },
    { source: "COACH", visibility: "PRIVATE", createdBy: { in: enrollmentCoaches } }] };
}

export async function lastBankOvelse(id: string, viewer: Viewer, playerId: string, db: Db = prisma): Promise<ExerciseDefinition | null> {
  const row = await db.exerciseDefinition.findUnique({ where: { id } });
  if (!row) return null;
  if (row.source === "SYSTEM" || row.createdBy === viewer.id) return row;
  if (row.source === "COACH" && row.visibility === "PRIVATE" && row.createdBy &&
    await prisma.playerEnrollment.findFirst({ where: { userId: playerId, endedAt: null, coachId: row.createdBy }, select: { id: true } })) return row;
  if (row.source === "COACH" && row.visibility === "COACH_PLAYERS" && row.createdBy &&
    await harCoachTilgangTilSpiller({ id: row.createdBy, role: "COACH" }, playerId)) return row;
  return null;
}

export async function lastBankOppgave(id: string, playerId: string, db: Db = prisma) {
  return db.positionTask.findFirst({ where: { id, status: { not: "ARCHIVED" }, position: { plan: { userId: playerId, status: "ACTIVE" } } },
    include: { position: true } });
}

/** Referanser avledes fra en autorisert kilde; klientens ID alene er aldri tilgang. */
export async function hentBankReferanser(ref: Ref, viewer: Viewer, playerId: string, db: Db = prisma): Promise<
  { ok: true; data: Ref } | typeof avvist
> {
  if (!ref.sourceId && !ref.exerciseId && !ref.positionTaskId) return { ok: true, data: {} };
  const source = ref.sourceId ? parseSourceId(ref.sourceId) : null;
  let exerciseId = source?.kind === "DRILL" ? source.exerciseId : ref.exerciseId;
  let positionTaskId = source?.kind === "TEK" ? source.taskId : ref.positionTaskId;
  if (source && source.kind !== "DRILL" && source.kind !== "TEK") return avvist;
  if (exerciseId && positionTaskId) return avvist;
  if ((exerciseId && ref.exerciseId && exerciseId !== ref.exerciseId) ||
    (positionTaskId && ref.positionTaskId && positionTaskId !== ref.positionTaskId)) return avvist;
  if (!source && ref.sourceId && (exerciseId || positionTaskId) && ref.sourceId !== (exerciseId ?? positionTaskId)) return avvist;
  // Eldre SourceItem.drill har rå kilde-ID. Ukjent proveniens beholdes som
  // tekst, men gir ingen konkret bank-/oppgavekobling.
  if (!exerciseId && !positionTaskId && ref.sourceId) {
    const exercise = await db.exerciseDefinition.findUnique({ where: { id: ref.sourceId } });
    if (exercise) exerciseId = exercise.id;
    else if (await db.positionTask.findUnique({ where: { id: ref.sourceId }, select: { id: true } })) positionTaskId = ref.sourceId;
  }
  if (exerciseId && !(await lastBankOvelse(exerciseId, viewer, playerId, db))) return avvist;
  if (positionTaskId && !(await lastBankOppgave(positionTaskId, playerId, db))) return avvist;
  return { ok: true, data: { sourceId: ref.sourceId, exerciseId, positionTaskId } };
}
