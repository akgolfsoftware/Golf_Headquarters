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

const CountsSchema = z
  .array(
    z.object({
      club: z.string().min(1).max(40),
      count: z.number().int().min(0).max(5000),
    }),
  )
  .max(20);

async function persistCounts(sessionId: string, counts: unknown, finish: boolean) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = CountsSchema.safeParse(counts);
  if (!parsed.success || new Set(parsed.data.map((r) => r.club)).size !== parsed.data.length) {
    return { ok: false, error: "Ugyldig tapper-data." };
  }
  try {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.trainingPlanSession.findUnique({
        where: { id: sessionId },
        select: { id: true, status: true, updatedAt: true, plan: { select: { userId: true } } },
      });
      const wb = plan ? null : await tx.workbenchSession.findUnique({
        where: { id: sessionId },
        select: { id: true, playerId: true, status: true, updatedAt: true, hiddenByPlayer: true, needsPlayerApproval: true },
      });
      const ownerId = plan?.plan.userId ?? wb?.playerId;
      if (!ownerId || !(await canAccessPlayer(user, ownerId))) throw new Error("Ingen tilgang.");
      const row = plan ?? wb;
      if (!row) throw new Error("Økt ikke funnet.");
      // En retry etter fullføring må aldri overskrive sluttresultatet.
      if (row.status === "COMPLETED" && finish) return;
      if (!["ACTIVE", "PAUSED", "IN_PROGRESS"].includes(row.status) || wb?.hiddenByPlayer || wb?.needsPlayerApproval) {
        throw new Error("Økten er ikke pågående.");
      }
      // Lås øktraden før tellingene. Samtidige eller forsinkede kall avvises
      // dersom tilstanden endres mellom lesing og skriving.
      const where = { id: sessionId, status: row.status, updatedAt: row.updatedAt };
      if (plan) {
        await tx.trainingPlanSession.update({ where: { ...where, status: plan.status }, data: { status: finish ? "COMPLETED" : plan.status } });
      } else {
        await tx.workbenchSession.update({ where, data: { status: finish ? "COMPLETED" : row.status } });
      }
      for (const rad of parsed.data) {
        await tx.sessionBallLog.upsert({
          where: { planSessionId_club: { planSessionId: sessionId, club: rad.club } },
          create: { planSessionId: sessionId, club: rad.club, count: rad.count },
          update: { count: rad.count },
        });
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
