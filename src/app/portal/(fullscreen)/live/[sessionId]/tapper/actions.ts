"use server";

import { canAccessPlayer } from "@/lib/auth/own-or-coached";

/**
 * Tapper-persistering: baller per kølle per plan-økt → session_ball_logs.
 * Absolutt count (ikke inkrement) + UNIQUE(planSessionId, club) → idempotent
 * ved retry/debounce. Samme tilgangsregel som tapper-siden: eier eller
 * coach/admin.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { jsonObject, readSessionExecution, executionSeconds, sealSessionSnapshot } from "@/lib/workbench/wb-session-life";
import { GENERERT_FRA } from "@/lib/workbench/v2-drill-mirror";
import { readPrecisionProgress } from "@/lib/portal-live/session-progress";

const CountsSchema = z
  .array(
    z.object({
      club: z.string().min(1).max(60),
      count: z.number().int().min(0).max(5000),
      area: z.string().max(40).optional().nullable(),
      category: z.string().max(40).optional().nullable(),
      repetitionType: z.string().max(40).optional().nullable(),
    }),
  )
  .max(100);

async function persistCounts(sessionId: string, counts: unknown, finish: boolean) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = CountsSchema.safeParse(counts);
  if (!z.string().min(1).max(100).safeParse(sessionId).success || !parsed.success || new Set(parsed.data.map((r) => r.club)).size !== parsed.data.length) {
    return { ok: false, error: "Ugyldig tapper-data." };
  }
  try {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.trainingPlanSession.findUnique({
        where: { id: sessionId },
        select: { id: true, status: true, updatedAt: true, liveSnapshot: true, plan: { select: { userId: true } } },
      });
      const wb = plan ? null : await tx.workbenchSession.findUnique({
        where: { id: sessionId },
        select: { id: true, playerId: true, status: true, updatedAt: true, liveSnapshot: true, hiddenByPlayer: true, needsPlayerApproval: true, isTemplate: true, approvalStatus: true },
      });
      const v2 = plan || wb ? null : await tx.trainingSessionV2.findUnique({ where: { id: sessionId }, select: { id: true, status: true, updatedAt: true,
        studentId: true, hostId: true, coachId: true, completedSummary: true, generertFra: true, generertFraId: true,
        participants: { where: { userId: user.id }, select: { userId: true, status: true } } } });
      const ownerId = plan?.plan.userId ?? wb?.playerId ?? v2?.studentId ?? v2?.hostId ?? v2?.coachId;
      const ownV2 = v2 && ([v2.studentId, v2.hostId, v2.coachId].includes(user.id) || v2.participants.some((p) => p.userId === user.id && ["ACCEPTED", "ATTENDED"].includes(p.status)));
      if (!ownerId || (!ownV2 && !(await canAccessPlayer(user, ownerId)))) throw new Error("Ingen tilgang.");
      const row = plan ?? wb ?? v2;
      if (!row) throw new Error("Økt ikke funnet.");
      // En retry etter fullføring må aldri overskrive sluttresultatet.
      if (row.status === "COMPLETED" && finish) return;
      if (!["ACTIVE", "PAUSED", "IN_PROGRESS"].includes(row.status) || wb?.hiddenByPlayer || wb?.needsPlayerApproval || wb?.isTemplate || wb?.approvalStatus === "REJECTED") {
        throw new Error("Økten er ikke pågående.");
      }
      // Lås øktraden før tellingene. Samtidige eller forsinkede kall avvises
      // dersom tilstanden endres mellom lesing og skriving.
      const where = { id: sessionId, status: row.status, updatedAt: row.updatedAt };
      const now = new Date();
      const previousCounts = await tx.sessionBallLog.findMany({ where: { planSessionId: sessionId }, select: { club: true, count: true } });
      const mergedCounts = new Map(previousCounts.map((c) => [c.club, c.count]));
      for (const count of parsed.data) mergedCounts.set(count.club, count.count);
      const totalReps = [...mergedCounts.values()].reduce((sum, count) => sum + count, 0);
      const sealed = finish ? { ...sealSessionSnapshot(v2?.completedSummary ?? plan?.liveSnapshot ?? wb?.liveSnapshot, "COMPLETED", now.toISOString()), tapperTotalShots: totalReps } : null;
      if (plan) {
        await tx.trainingPlanSession.update({ where: { ...where, status: plan.status }, data: { status: finish ? "COMPLETED" : plan.status, ...(sealed ? { liveSnapshot: sealed as Prisma.InputJsonObject } : {}) } });
      } else if (wb) {
        await tx.workbenchSession.update({ where, data: { status: finish ? "COMPLETED" : row.status, ...(sealed ? { liveSnapshot: sealed as Prisma.InputJsonObject } : {}) } });
      } else if (v2) {
        const raw = jsonObject(v2.completedSummary) ?? {};
        const execution = readSessionExecution(raw);
        const completedDrillIds = readPrecisionProgress(raw).filter((d) => d.status === "done").map((d) => d.drillId);
        await tx.trainingSessionV2.update({ where: { ...where, status: v2.status }, data: { status: finish ? "COMPLETED" : v2.status,
          ...(finish ? { completedSummary: { ...sealed, liveSummary: { totalReps, drillsCompleted: completedDrillIds.length, completedDrillIds,
            completedAt: now.toISOString(), ...(typeof raw.startedAtISO === "string" ? { startedAt: raw.startedAtISO } : {}),
            ...(execution ? { durationSec: executionSeconds(execution, now.getTime()) } : {}) } } as Prisma.InputJsonObject } : {}) } });
      }
      for (const rad of parsed.data) {
        await tx.sessionBallLog.upsert({
          where: { planSessionId_club: { planSessionId: sessionId, club: rad.club } },
          create: {
            planSessionId: sessionId,
            club: rad.club,
            count: rad.count,
            area: rad.area ?? null,
            category: rad.category ?? null,
            repetitionType: rad.repetitionType ?? null,
          },
          update: {
            count: rad.count,
            area: rad.area ?? null,
            category: rad.category ?? null,
            repetitionType: rad.repetitionType ?? null,
          },
        });
      }
      if (finish && plan) {
        const raw = jsonObject(plan.liveSnapshot);
        const startedAt = typeof raw?.startedAtISO === "string" && Number.isFinite(Date.parse(raw.startedAtISO)) ? new Date(raw.startedAtISO) : now;
        await tx.trainingPlanSessionLog.upsert({ where: { sessionId }, create: { sessionId, startedAt, completedAt: now, totalReps }, update: { completedAt: now, totalReps } });
      }
      if (finish && v2?.generertFra === GENERERT_FRA && v2.generertFraId) {
        const mirror = await tx.trainingPlanSession.findUnique({ where: { id: v2.generertFraId }, select: { id: true, status: true, liveSnapshot: true, updatedAt: true, plan: { select: { userId: true } } } });
        if (!mirror || mirror.plan.userId !== ownerId) throw new Error("Planspeilet tilhører ikke denne spilleren.");
        if (mirror.status !== "COMPLETED") {
          const raw = jsonObject(v2.completedSummary);
          const startedAt = typeof raw?.startedAtISO === "string" && Number.isFinite(Date.parse(raw.startedAtISO)) ? new Date(raw.startedAtISO) : now;
          await tx.trainingPlanSession.update({ where: { id: mirror.id, status: mirror.status, updatedAt: mirror.updatedAt }, data: { status: "COMPLETED",
            liveSnapshot: { ...sealSessionSnapshot(mirror.liveSnapshot, "COMPLETED", now.toISOString()), tapperTotalShots: totalReps } as Prisma.InputJsonObject } });
          await tx.trainingPlanSessionLog.upsert({ where: { sessionId: mirror.id }, create: { sessionId: mirror.id, startedAt, completedAt: now, totalReps }, update: { completedAt: now, totalReps } });
        }
      }
    });
  } catch {
    return { ok: false, error: "Kunne ikke lagre økten. Kontroller tilgang og øktstatus, og prøv igjen." };
  }
  revalidatePath("/portal");
  revalidatePath("/portal/planlegge");
  revalidatePath(`/portal/live/${sessionId}`, "layout");
  return { ok: true };
}

export async function saveTapperCounts(sessionId: string, counts: unknown): Promise<{ ok: boolean; error?: string }> {
  return persistCounts(sessionId, counts, false);
}

/** Sluttelling og fullført-status lagres samlet. Naviger først ved ok. */
export async function finishTapperSession(sessionId: string, counts: unknown): Promise<{ ok: boolean; error?: string }> {
  return persistCounts(sessionId, counts, true);
}
