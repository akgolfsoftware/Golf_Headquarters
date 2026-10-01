"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canAccessPlayer } from "@/lib/auth/own-or-coached";
import { AkFormelSchema, PyramidAreaSchema } from "@/lib/domain/workbench/schemas";
import { DrillResultSchema, DrillResultsSchema, FysResultSchema, GolfResultSchema, readDrillResults, technicalCounts } from "@/lib/portal-live/training-result";
import { applyPositionTaskReps } from "@/lib/teknisk-plan/apply-reps";
const Input = z.object({ sessionId: z.string().min(1), drillId: z.string().min(1), expectedUpdatedAt: z.string().datetime(), result: z.union([GolfResultSchema, FysResultSchema]), actualDurationSec: z.number().int().min(0).max(86400).nullable() });
/** Absolutte målinger; eierskap, kilde og revisjon leses på serveren. */
export async function saveWorkbenchDrillResult(input: unknown) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Ugyldig treningsresultat." };
  const user = await requirePortalUser();
  const row = await prisma.workbenchSession.findUnique({ where: { id: parsed.data.sessionId }, include: { drills: true } });
  if (!row || !(await canAccessPlayer(user, row.playerId))) return { ok: false as const, error: "Ingen tilgang til økten." };
  if (row.status !== "IN_PROGRESS" || row.hiddenByPlayer || row.needsPlayerApproval || row.approvalStatus === "REJECTED") return { ok: false as const, error: "Økten er ikke pågående." };
  const drill = row.drills.find(d => d.id === parsed.data.drillId);
  if (!drill) return { ok: false as const, error: "Øvelsen tilhører ikke økten." };
  const formel = AkFormelSchema.safeParse(drill.akFormel);
  const pyramid = PyramidAreaSchema.safeParse(formel.success ? formel.data.pyramid : row.pyramid);
  if (!pyramid.success) return { ok: false as const, error: "Øvelsens treningsakse er ukjent." };
  const axis = pyramid.data;
  if ((axis === "FYS") !== (parsed.data.result.type !== "golf")) return { ok: false as const, error: "Resultatets måleenhet stemmer ikke med øvelsen." };
  if (formel.success && axis === "FYS") {
    const expected = formel.data.area === "STYRKE" ? ["styrke"] : formel.data.area === "KONDISJON" ? ["kondisjon"] : formel.data.area === "BEVEGELIGHET" ? ["hold", "reps"] : null;
    if (expected && !expected.includes(parsed.data.result.type)) return { ok: false as const, error: "Resultatets måleenhet stemmer ikke med fysisk område." };
  }
  if (row.liveSnapshot && typeof row.liveSnapshot === "object" && "drillResults" in row.liveSnapshot && !DrillResultsSchema.safeParse(row.liveSnapshot.drillResults).success) return { ok: false as const, error: "Eksisterende resultater kunne ikke leses. Ingen data er endret." };
  const previous = readDrillResults(row.liveSnapshot);
  const prior = previous.find(r => r.drillId === drill.id);
  if (prior && (prior.source.pyramid !== axis || prior.result.type !== parsed.data.result.type)) return { ok: false as const, error: "Øvelsens akse eller måleenhet er endret. Opprett en ny øvelse for det nye resultatet." };
  if (prior && JSON.stringify(prior.result) === JSON.stringify(parsed.data.result) && prior.actualDurationSec === parsed.data.actualDurationSec) return { ok: true as const, updatedAt: row.updatedAt.toISOString() };
  if (row.updatedAt.toISOString() !== parsed.data.expectedUpdatedAt) return { ok: false as const, error: "Økten ble endret. Last inn på nytt." };
  const taskId = drill.positionTaskId ?? (drill.techniqueFocus ? drill.sourceId : null);
  const task = taskId ? await prisma.positionTask.findFirst({ where: { id: taskId, position: { plan: { userId: row.playerId } } }, select: { id: true, updatedAt: true } }) : null;
  if (taskId && !task) return { ok: false as const, error: "Den tekniske oppgaven er ikke tilgjengelig for spilleren." };
  const result = {
    drillId: drill.id, result: parsed.data.result, actualDurationSec: parsed.data.actualDurationSec, loggedAt: new Date().toISOString(),
    source: prior?.source ?? { pyramid: axis, planRevision: row.updatedAt.toISOString(), sourceId: drill.sourceId, sourceRevision: task?.updatedAt.toISOString() ?? null, positionTaskId: task?.id ?? null, exerciseId: drill.exerciseId, title: drill.title, akFormel: formel.success ? formel.data : null, repType: drill.repType, repAntall: drill.repAntall, repMinutter: drill.repMinutter, repSett: drill.repSett, repReps: drill.repReps, durationMinutes: drill.durationMinutes },
  };
  if (!DrillResultSchema.safeParse(result).success) return { ok: false as const, error: "Øvelsens kildedata er ugyldige. Ingen data er endret." };
  const snapshot = row.liveSnapshot && typeof row.liveSnapshot === "object" && !Array.isArray(row.liveSnapshot) ? row.liveSnapshot : {};
  try {
    const saved = await prisma.$transaction(async tx => {
      const updated = await tx.workbenchSession.updateMany({ where: { id: row.id, status: "IN_PROGRESS", updatedAt: row.updatedAt }, data: { liveSnapshot: { ...snapshot, drillResults: [...previous.filter(r => r.drillId !== drill.id), result] } satisfies Prisma.InputJsonObject } });
      if (updated.count !== 1) throw new Error("collision");
      if (task && parsed.data.result.type === "golf") {
        const current = technicalCounts(parsed.data.result);
        const old = prior?.result.type === "golf" ? technicalCounts(prior.result) : { dry: 0, lav: 0, full: 0 };
        await applyPositionTaskReps(task.id, { dry: current.dry - old.dry, lav: current.lav - old.lav, full: current.full - old.full }, user.id, { sessionV2Id: row.id, belastning: formel.success ? formel.data.belastning === "TRENINGSOMRADE" ? "TRENINGSOMRAADE" : formel.data.belastning : null, notater: parsed.data.result.notat }, tx);
      }
      return tx.workbenchSession.findUniqueOrThrow({ where: { id: row.id }, select: { updatedAt: true } });
    });
    revalidatePath("/portal"); revalidatePath("/portal/analysere"); revalidatePath(`/portal/live/${row.id}/summary`); revalidatePath(`/admin/workbench/${row.playerId}`);
    return { ok: true as const, updatedAt: saved.updatedAt.toISOString() };
  } catch { return { ok: false as const, error: "Resultatet ble ikke lagret. Last inn på nytt og prøv igjen." }; }
}
