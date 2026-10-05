import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { TnSessionSchema } from "./tn-session";
import { tnProtocol } from "./tn-catalog";
import { tnValidate } from "./tn-scoring";
import { tnComparableResult, tnDefinitionId } from "./tn-integration";

export function tnAnonymisedSession(testId: string, raw: unknown) {
  const parsed = TnSessionSchema.safeParse(raw);
  if (!parsed.success) return null;
  const state = parsed.data;
  const base = tnProtocol(state.protocolId, undefined, state.version);
  const p = base?.variableCount ? tnProtocol(state.protocolId, state.count, state.version) : base;
  if (!p || p.rows.length !== state.count || tnDefinitionId(p) !== testId || tnValidate(p, state.values, false)) return null;
  return { version: state.version, protocolId: state.protocolId, count: state.count, revision: state.revision, values: state.values, notes: "" };
}
/** Only this owner's versioned TN sessions/results; never group peers. */
export async function anonymiserTnTestdata(userId: string): Promise<void> {
  const where = { userId, testId: { startsWith: "tn-v3-" } };
  const sessions = await prisma.testSession.findMany({ where, select: { id: true, testId: true, scoringData: true } });
  for (const row of sessions) await prisma.testSession.updateMany({ where: { ...where, id: row.id }, data: { scoringData: tnAnonymisedSession(row.testId, row.scoringData) ?? Prisma.JsonNull } });
  const results = await prisma.testResult.findMany({ where, select: { id: true, testId: true, score: true, details: true } });
  for (const row of results) {
    const canonical = tnComparableResult(row.testId, row.score, row.details);
    await prisma.testResult.updateMany({ where: { ...where, id: row.id }, data: { notes: null, details: canonical ?? Prisma.DbNull } });
  }
}
