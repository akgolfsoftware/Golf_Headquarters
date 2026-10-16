import { formaterLagretTestResultat } from "./resultat-visning";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { tnComparableResult } from "./tn-integration";
import { foreslaGodkjenteOvelser, sammenlignMedForrige } from "./test-anbefaling";
import { osloDatoOgMinutt } from "@/lib/workbench/min-calendar";

export async function loadTestFollowup(playerId: string, viewer: { id: string; role: string }) {
  if (viewer.role !== "COACH" && viewer.role !== "ADMIN") return null;
  const player = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(viewer), { id: playerId }] },
    select: {
      id: true,
      playerFacilities: {
        select: { capabilities: true, maksPuttLengdeM: true, rangeLengdeM: true },
      },
    },
  });
  if (!player) return null;

  const now = osloDatoOgMinutt(new Date());
  const today = new Date(`${now.date}T00:00:00.000Z`);
  const yearStart = new Date(`${now.date.slice(0, 4)}-01-01T00:00:00.000Z`);
  const [results, testdager, tildelinger, futureSessions] = await Promise.all([
    prisma.testResult.findMany({
      where: { userId: playerId },
      orderBy: { takenAt: "desc" },
      take: 100,
      select: {
        id: true, testId: true, score: true, details: true, takenAt: true,
        test: { select: { id: true, name: true, omraade: true, protocol: true } },
      },
    }),
    prisma.workbenchSession.findMany({
      where: { playerId, blockType: "TEST", date: { gte: yearStart } },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      select: { id: true, date: true, startMinute: true, title: true, status: true },
    }),
    prisma.testAssignment.findMany({
      where: { playerId, status: "OPEN" },
      orderBy: { dueDate: "asc" },
      select: { id: true, dueDate: true, test: { select: { name: true } } },
    }),
    prisma.workbenchSession.findMany({
      where: { playerId, blockType: "OEKT", status: "DRAFT", date: { gte: today } },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      take: 30,
      select: { id: true, date: true, startMinute: true, title: true, environment: true },
    }),
  ]);

  const bank = hentGodkjenteOvelsesbankElementer();
  const latest = new Map<string, (typeof results)[number]>();
  for (const result of results) {
    if (!latest.has(result.testId)) latest.set(result.testId, result);
  }
  const rader = [...latest.values()].slice(0, 12).map((result) => {
    const tn = tnComparableResult(result.testId, result.score, result.details);
    const forslag = result.testId.startsWith("tn-v3-") && !tn
      ? []
      : foreslaGodkjenteOvelser({
        test: result.test,
        bank,
        fasiliteter: player.playerFacilities,
        spillerKategori: null,
      });
    return {
      id: result.id,
      testId: result.testId,
      testNavn: result.test.name,
      dato: result.takenAt,
      score: formaterLagretTestResultat({ ...result, protocol: result.test.protocol }),
      trend: sammenlignMedForrige(result, results),
      forslag,
    };
  });

  return {
    testdager,
    tildelinger,
    rader,
    futureSessions: futureSessions.filter((s) => {
      const dato = s.date.toISOString().slice(0, 10);
      return dato > now.date || (dato === now.date && s.startMinute > now.minute);
    }),
  };
}
