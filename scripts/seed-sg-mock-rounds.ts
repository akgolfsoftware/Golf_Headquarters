/**
 * Lagrer 1000 fiktive slag for EN testspiller i en isolert lokal database.
 * Avviser hostede databaseadresser og andre databasenavn enn akgolf_sg_mock.
 *
 * DIRECT_URL=postgresql://...@127.0.0.1:PORT/akgolf_sg_mock \
 *   npx tsx scripts/seed-sg-mock-rounds.ts --apply
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateSgMockRounds, SG_MOCK_VERSION } from "../src/lib/domain/sg-mock-rounds";
import { simulateSgGrossRounds, type HistoricalSgRound } from "../src/lib/domain/sg-round-simulation";

const USER_ID = "sg-mock-player-v1";
const COURSE_ID = "sg-mock-course-par72-v1";
const SOURCE = "synthetic_sg_test";

function localDatabaseUrl(raw: string | undefined): string {
  if (!raw) throw new Error("DIRECT_URL mangler");
  const url = new URL(raw);
  if (!(["postgres:", "postgresql:"].includes(url.protocol)) ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.pathname !== "/akgolf_sg_mock") {
    throw new Error("Mock-data kan bare skrives til lokal database akgolf_sg_mock");
  }
  return raw;
}

async function main() {
  const rounds = generateSgMockRounds();
  const generatedShots = rounds.reduce((sum, round) => sum + round.shots.length, 0);
  if (generatedShots !== 1000) throw new Error(`Forventet 1000 slag, fikk ${generatedShots}`);
  if (!process.argv.includes("--apply")) {
    console.log(`Klar: ${rounds.length} fiktive runder, ${generatedShots} slag. Bruk --apply for lokal lagring.`);
    return;
  }

  const dbUrl = localDatabaseUrl(process.env.DIRECT_URL);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });
  try {
    const user = await prisma.user.upsert({
      where: { id: USER_ID },
      create: {
        id: USER_ID, authId: "00000000-0000-4000-8000-000000000042",
        email: "sg-mock-player@akgolf.test", name: "SG testspiller",
      },
      update: {}, select: { id: true, authId: true, email: true },
    });
    if (user.authId !== "00000000-0000-4000-8000-000000000042" ||
        user.email !== "sg-mock-player@akgolf.test") {
      throw new Error("Testspiller-ID tilhører allerede en annen bruker");
    }
    const course = await prisma.courseDefinition.upsert({
      where: { id: COURSE_ID },
      create: { id: COURSE_ID, name: "Syntetisk par 72", par: 72 },
      update: {}, select: { id: true, name: true, par: true },
    });
    if (course.name !== "Syntetisk par 72" || course.par !== 72) {
      throw new Error("Testbane-ID tilhører allerede en annen bane");
    }

    for (const round of rounds) {
      const id = `sg-mock-round-${round.roundNumber}`;
      const existing = await prisma.round.findUnique({ where: { id }, select: { userId: true, source: true, score: true } });
      if (existing) {
        if (existing.userId !== USER_ID || existing.source !== SOURCE || existing.score !== round.score) {
          throw new Error(`Eksisterende runde ${id} har en annen identitet eller score`);
        }
        continue;
      }
      await prisma.round.create({
        data: {
          id, userId: USER_ID, courseId: COURSE_ID,
          playedAt: new Date(Date.UTC(2026, 8, round.roundNumber)),
          score: round.score, source: SOURCE, sourceDate: new Date("2026-10-02T00:00:00.000Z"),
          dataQuality: "synthetic", status: "COMPLETED", sgSource: SG_MOCK_VERSION,
          sgOtt: round.sg.OTT, sgApp: round.sg.APP, sgArg: round.sg.ARG,
          sgPutt: round.sg.PUTT, sgTotal: round.sg.total,
          shots: { create: round.shots.map(({ category: _category, sg: _sg, ...shot }) => shot) },
          holeScores: { create: round.holeScores },
        }, select: { id: true },
      });
    }

    const saved = await prisma.round.findMany({
      where: { userId: USER_ID, source: SOURCE },
      select: {
        id: true, score: true, courseId: true, sgSource: true,
        sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, sgTotal: true,
        course: { select: { par: true } },
        holeScores: { select: { strokes: true, par: true } },
        shots: { select: { holeNumber: true } },
      },
    });
    const savedShots = saved.reduce((sum, round) => sum + round.shots.length, 0);
    if (saved.length !== 13 || savedShots !== 1000 ||
        saved.some((round) => round.holeScores.length !== 18 ||
          round.holeScores.reduce((sum, hole) => sum + hole.strokes, 0) !== round.score ||
          round.holeScores.reduce((sum, hole) => sum + hole.par, 0) !== 72 ||
          round.shots.length !== round.score)) {
      throw new Error("Lokal database inneholder ikke 13 konsistente par 72-runder og 1000 slag");
    }
    console.log(`Verifisert lokal testdatabase: ${saved.length} runder og ${savedShots} fiktive slag.`);
    const historical: HistoricalSgRound[] = saved.map((round) => {
      if (round.sgSource !== SG_MOCK_VERSION ||
          round.sgOtt == null || round.sgApp == null || round.sgArg == null ||
          round.sgPutt == null || round.sgTotal == null) {
        throw new Error("Mock-runde mangler SG-felt eller versjon");
      }
      return {
        courseId: round.courseId, par: round.course.par, grossScore: round.score,
        sgOtt: round.sgOtt, sgApp: round.sgApp, sgArg: round.sgArg,
        sgPutt: round.sgPutt, sgTotal: round.sgTotal, sgVersion: round.sgSource,
      };
    });
    const simulation = simulateSgGrossRounds({
      historicalRounds: historical, targetCourseId: COURSE_ID, targetPar: 72,
    });
    if (simulation.status !== "demo_only") throw new Error(`Lokal simulering feilet: ${simulation.status}`);
    console.log(`100 simulerte bruttorunder: ${simulation.belowParCount} under par; snitt ${simulation.averageGrossScore}. Kun demo.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
