"use server";

/**
 * Tapper-persistering: baller per kølle per plan-økt → session_ball_logs.
 * Absolutt count (ikke inkrement) + UNIQUE(planSessionId, club) → idempotent
 * ved retry/debounce. Samme tilgangsregel som tapper-siden: eier eller
 * coach/admin.
 */

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

export async function saveTapperCounts(
  sessionId: string,
  counts: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const parsed = CountsSchema.safeParse(counts);
  if (!parsed.success) return { ok: false, error: "Ugyldig tapper-data." };

  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  const plan = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, plan: { select: { userId: true } } },
  });
  const wb = plan
    ? null
    : await prisma.workbenchSession.findUnique({
        where: { id: sessionId },
        select: { id: true, playerId: true },
      });
  if (!plan && !wb) return { ok: false, error: "Økt ikke funnet." };

  const eierId = plan?.plan.userId ?? wb?.playerId;
  const erEier = eierId === user.id;
  if (!erEier && !erCoach) return { ok: false, error: "Ingen tilgang." };

  for (const rad of parsed.data) {
    await prisma.sessionBallLog.upsert({
      where: { planSessionId_club: { planSessionId: sessionId, club: rad.club } },
      create: { planSessionId: sessionId, club: rad.club, count: rad.count },
      update: { count: rad.count },
    });
  }
  return { ok: true };
}
