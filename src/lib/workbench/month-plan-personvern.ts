import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { MonthDetailsSchema, MonthEvaluationSchema } from "@/lib/domain/month-plan";

const select = { id: true, playerId: true, groupId: true, year: true, month: true, details: true, proposedDetails: true, proposedBy: true, playerEvaluation: true, coachEvaluation: true, createdBy: true, updatedBy: true, createdAt: true, updatedAt: true, revision: true, activeRevision: true } satisfies Prisma.MonthlyPlanSelect;
const author = (field: "playerEvaluation" | "coachEvaluation", id: string): Prisma.MonthlyPlanWhereInput => ({ [field]: { path: ["authorId"], equals: id } });
function ownsEvaluation(value: unknown, id: string) { const parsed = MonthEvaluationSchema.safeParse(value); return parsed.success && parsed.data.authorId === id; }

/** Called only by the authenticated GDPR export; never returns another player's active plan. */
export async function eksporterMaanedsplaner(userId: string) {
  const [personal, authored] = await Promise.all([
    prisma.monthlyPlan.findMany({ where: { playerId: userId }, select }),
    prisma.monthlyPlan.findMany({ where: { AND: [{ OR: [{ playerId: null }, { playerId: { not: userId } }] }, { OR: [{ createdBy: userId }, { updatedBy: userId }, { proposedBy: userId }, author("playerEvaluation", userId), author("coachEvaluation", userId)] }] }, select }),
  ]);
  return {
    egnePlaner: personal,
    forfatterspor: authored.map(row => ({ id: row.id, groupId: row.groupId, year: row.year, month: row.month, createdAt: row.createdAt, updatedAt: row.updatedAt,
      opprettetAvDeg: row.createdBy === userId, sistEndretAvDeg: row.updatedBy === userId,
      forslag: row.proposedBy === userId ? row.proposedDetails : null,
      spillerevaluering: ownsEvaluation(row.playerEvaluation, userId) ? row.playerEvaluation : null,
      coachevaluering: ownsEvaluation(row.coachEvaluation, userId) ? row.coachEvaluation : null,
    })),
  };
}
function cleanDetails(value: unknown) {
  const parsed = MonthDetailsSchema.safeParse(value);
  return parsed.success ? { ...parsed.data, focus: "", goals: [], purpose: "", location: "", note: "" } : null;
}
function cleanEvaluation(value: unknown, userId: string) {
  const parsed = MonthEvaluationSchema.safeParse(value);
  return parsed.success ? { ...parsed.data, text: "", authorId: parsed.data.authorId === userId ? "anonymisert" : parsed.data.authorId } : null;
}
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Keep validated numeric/priority data; clear free text, proposals and the deleted author's identifiers. */
export async function anonymiserMaanedsplaner(userId: string): Promise<number> {
  const rows = await prisma.monthlyPlan.findMany({ where: { OR: [{ playerId: userId }, { createdBy: userId }, { updatedBy: userId }, { proposedBy: userId }, author("playerEvaluation", userId), author("coachEvaluation", userId)] }, select });
  let cleaned = 0;
  for (const row of rows) {
    const personal = row.playerId === userId;
    const authoredGroup = row.groupId !== null && (row.createdBy === userId || row.updatedBy === userId);
    const update: Prisma.MonthlyPlanUpdateManyMutationInput = {};
    if ((personal || authoredGroup) && row.details !== null) {
      const details = cleanDetails(row.details);
      if (!equal(details, row.details)) { update.details = details ?? Prisma.DbNull; update.activeRevision = row.activeRevision + 1; }
    }
    if (row.proposedDetails !== null && (personal || row.proposedBy === userId)) {
      update.proposedDetails = Prisma.DbNull; update.proposedBy = null; update.proposalBaseActiveRevision = null;
    }
    for (const field of ["playerEvaluation", "coachEvaluation"] as const) {
      if (row[field] !== null && (personal || ownsEvaluation(row[field], userId))) {
        const value = cleanEvaluation(row[field], userId);
        if (!equal(value, row[field])) update[field] = value ?? Prisma.DbNull;
      }
    }
    if (row.createdBy === userId) update.createdBy = "anonymisert";
    if (row.updatedBy === userId) update.updatedBy = "anonymisert";
    if (Object.keys(update).length === 0) continue;
    const result = await prisma.monthlyPlan.updateMany({ where: { id: row.id, revision: row.revision }, data: { ...update, revision: row.revision + 1, lastRequestId: null, lastRequestHash: null } });
    if (result.count !== 1) throw new Error("Månedsplanen ble endret under anonymisering. Gjenta anonymiseringen før kontoen ferdigstilles.");
    cleaned += result.count;
  }
  return cleaned;
}
