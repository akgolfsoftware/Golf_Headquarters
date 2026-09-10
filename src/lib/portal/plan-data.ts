import "server-only";
import { prisma } from "@/lib/prisma";
import { assertCanViewPlayerData } from "@/lib/auth/assert-own-or-coached";
import { tilDatoKolonne, SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import { workbenchWeekSession } from "./workbench-week";
import type { PlanForslag } from "./plan-visning";

/** Publiserte forslag; utkast og allerede avviste økter blir aldri foreslått på nytt. */
export async function hentPlanForslag(playerId: string, mandag: string): Promise<PlanForslag[]> {
  await assertCanViewPlayerData(playerId);
  const fra = tilDatoKolonne(mandag);
  const til = new Date(fra);
  til.setUTCDate(til.getUTCDate() + 7);
  const rows = await prisma.workbenchSession.findMany({
    where: {
      playerId, date: { gte: fra, lt: til }, status: { in: [...SPILLER_SYNLIGE_STATUSER] },
      hiddenByPlayer: false, needsPlayerApproval: true,
      OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }],
    },
    include: { drills: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });
  const coaches = rows.length ? await prisma.user.findMany({
    where: { id: { in: [...new Set(rows.map((r) => r.coachId))] } }, select: { id: true, name: true },
  }) : [];
  const navn = new Map(coaches.map((c) => [c.id, c.name]));
  return rows.map((row) => ({ session: workbenchWeekSession(row), coachName: navn.get(row.coachId) ?? null }));
}
