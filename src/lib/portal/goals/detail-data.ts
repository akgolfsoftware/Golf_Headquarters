import "server-only";
import { prisma } from "@/lib/prisma";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";

/** Les mål bare for eier, administrator eller en konkret tilknyttet coach. */
export async function loadGoalForViewer(id: string, viewer: { id: string; role: string }) {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return null;
  if (goal.userId !== viewer.id && viewer.role !== "ADMIN") {
    if (viewer.role !== "COACH" || !(await harCoachTilgangTilSpiller(viewer, goal.userId))) return null;
  }
  const owner = await prisma.user.findUnique({ where: { id: goal.userId }, select: { hcp: true } });
  return { goal, hcp: owner?.hcp ?? null };
}
