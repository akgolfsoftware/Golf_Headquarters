import "server-only";
import { readPhysicalResultNote } from "@/lib/workbench/physical-result";
import { prisma } from "@/lib/prisma";
import { readDrillResults, golfResultCount, type DrillResult } from "@/lib/portal-live/training-result";

/** Intern leser etter spillerens tilgangsvakt. Uten måling forblir resultatet tomt. */
export async function loadTrainingResults(sessions: { id: string; model?: string }[]) {
  if (sessions.length === 0) return [];
  const [wb, v2] = await Promise.all([
    prisma.workbenchSession.findMany({ where: { id: { in: sessions.filter(s => s.model === "wb").map(s => s.id) } }, select: { id: true, liveSnapshot: true } }),
    prisma.trainingSessionV2.findMany({ where: { id: { in: sessions.filter(s => s.model === "v2").map(s => s.id) } }, select: { id: true, completedSummary: true } }),
  ]);
  return [...wb.map(row => ({ sessionId: row.id, results: readDrillResults(row.liveSnapshot) })), ...v2.map(row => ({ sessionId: row.id, results: readDrillResults(row.completedSummary) }))];
}
export function resultGolfCount(results: DrillResult[]): number | null {
  const golf = results.filter(r => r.result.type === "golf");
  return golf.length ? golf.reduce((sum, r) => sum + golfResultCount(r.result), 0) : null;
}

/** Serieverdier holdes i kg/reps/RIR og blandes aldri med golfrepetisjoner. */
export async function loadPhysicalResults(playerId: string, from: Date, to: Date) {
  const logs = await prisma.workbenchPhysicalLog.findMany({ where: { playerId, completedAt: { gte: from, lt: to } }, orderBy: { completedAt: "asc" },
    select: { id: true, exerciseId: true, setNumber: true, reps: true, weightKg: true, rir: true, completedAt: true, note: true } });
  return logs.map(log => { const record = readPhysicalResultNote(log.note); return { id: log.id, exerciseId: log.exerciseId, setNumber: log.setNumber, reps: log.reps, weightKg: log.weightKg, rir: log.rir, completedAt: log.completedAt.toISOString(), source: record?.source ?? null, note: record ? record.note : log.note }; });
}
