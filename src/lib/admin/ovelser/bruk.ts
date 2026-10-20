/**
 * Hvor mange ganger hver øvelse er brukt i Workbench-øktene til coachens spillere (/admin/ovelser).
 * Telles i alle økter, ikke i et tidsvindu. Mangler øvelsen rader, er den ikke i kartet (= 0).
 */
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

export async function hentBrukPerOvelse(viewer: { id: string; role: string }): Promise<Map<string, number>> {
  const spillere = await prisma.user.findMany({ where: coachScopedPlayerWhere(viewer), select: { id: true } });
  if (spillere.length === 0) return new Map();
  const rader = await prisma.workbenchDrill.groupBy({
    by: ["exerciseId"],
    where: { exerciseId: { not: null }, session: { playerId: { in: spillere.map((s) => s.id) } } },
    _count: { _all: true },
  });
  return new Map(rader.flatMap((r) => (r.exerciseId ? [[r.exerciseId, r._count._all] as const] : [])));
}
