import { prisma } from "@/lib/prisma";

/** Godkjenningen er engangsbruk, også når et eksternt svar blir usikkert. */
export async function claimPendingDraft(id: string, userId: string, approved: boolean): Promise<boolean> {
  const result = await prisma.caddieDraft.updateMany({
    where: { id, userId, status: "PENDING" },
    data: { status: approved ? "APPROVED" : "REJECTED", resolvedAt: new Date() },
  });
  return result.count === 1;
}
