import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { GENERERT_FRA } from "@/lib/workbench/v2-drill-mirror";

/** Samme utkast-/avvist-filter som spillerens Workbench. Datokrav settes på
 * V2-økten av kalleren: en flyttet speiløkt skal fortsatt skjule utkastet. */
export async function visibleV2Where(playerId: string): Promise<Prisma.TrainingSessionV2WhereInput> {
  const hidden = await prisma.trainingPlanSession.findMany({
    where: { plan: { userId: playerId, status: { in: ["DRAFT", "REJECTED"] } } },
    select: { id: true },
  });
  if (hidden.length === 0) return { studentId: playerId };
  return {
    studentId: playerId,
    OR: [
      { generertFra: null },
      { generertFra: { not: GENERERT_FRA } },
      { generertFraId: null },
      { generertFraId: { notIn: hidden.map((s) => s.id) } },
    ],
  };
}
