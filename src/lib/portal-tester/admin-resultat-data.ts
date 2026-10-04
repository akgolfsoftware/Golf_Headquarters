import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

/** The capability gate belongs to the page; row access also applies to counts. */
export async function hentAdminTestData(viewer: { id: string; role: string }, now = new Date()) {
  if (viewer.role !== "ADMIN" && viewer.role !== "COACH") throw new Error("Du har ikke tilgang til trenerens testoversikt.");
  const user = coachScopedPlayerWhere(viewer);
  const d30 = new Date(now.getTime() - 30 * 86_400_000);
  const d7 = new Date(now.getTime() - 7 * 86_400_000);
  const [paagaaende, resultater, antall30, antall7] = await Promise.all([
    prisma.testSession.findMany({
      where: { status: "IN_PROGRESS", user }, orderBy: { startedAt: "desc" }, take: 6,
      select: { id: true, startedAt: true, user: { select: { id: true, name: true } }, test: { select: { name: true } } },
    }),
    prisma.testResult.findMany({
      where: { user }, orderBy: [{ takenAt: "desc" }, { id: "desc" }], take: 20,
      select: {
        id: true, takenAt: true, score: true, testId: true, details: true,
        user: { select: { id: true, name: true } }, test: { select: { name: true, protocol: true } },
      },
    }),
    prisma.testResult.count({ where: { user, takenAt: { gte: d30 } } }),
    prisma.testResult.count({ where: { user, takenAt: { gte: d7 } } }),
  ]);
  return { paagaaende, resultater, antall30, antall7, d30 };
}
