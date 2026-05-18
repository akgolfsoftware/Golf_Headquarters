/**
 * Seed Anders Kristiansen som spiller-User (i tillegg til hans coach-konto).
 *
 * Idempotent: upserter på email anders+spiller@akgolfgroup.com.
 * Gir ham realistiske data slik at PlayerHQ kan demonstreres for ekte spiller-flate.
 *
 * Kjør: npx tsx scripts/seed-anders-spiller.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PLAYER_EMAIL = "anders+spiller@akgolfgroup.com";
const PLAYER_NAME = "Anders Kristiansen";

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function roundTo(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

async function main() {
  console.log("Seeder Anders Kristiansen som spiller...");

  // 1. Opprett/oppdater Anders som PLAYER
  const player = await prisma.user.upsert({
    where: { email: PLAYER_EMAIL },
    update: {
      name: PLAYER_NAME,
      role: "PLAYER",
      tier: "PRO",
      hcp: 4.2,
      playingYears: 28,
      ambition: "Holde sub-5 HCP og spille NM-Senior",
      homeClub: "Gamle Fredrikstad GK",
      avatarUrl: null,
    },
    create: {
      authId: `seed-${randomUUID()}`,
      email: PLAYER_EMAIL,
      name: PLAYER_NAME,
      role: "PLAYER",
      tier: "PRO",
      hcp: 4.2,
      playingYears: 28,
      ambition: "Holde sub-5 HCP og spille NM-Senior",
      homeClub: "Gamle Fredrikstad GK",
    },
  });
  console.log(`Spiller-User: ${player.id} (${player.email})`);

  // 2. Sørg for at vi har en CourseDefinition å koble runder mot
  let course = await prisma.courseDefinition.findFirst({
    where: { name: "Gamle Fredrikstad GK" },
  });
  if (!course) {
    course = await prisma.courseDefinition.create({
      data: { name: "Gamle Fredrikstad GK", par: 71, rating: 71.4, slope: 124 },
    });
  }

  // 3. Slett tidligere seed-data for denne spilleren (for å unngå duplikater)
  await prisma.round.deleteMany({ where: { userId: player.id } });
  await prisma.trackManSession.deleteMany({ where: { userId: player.id } });
  await prisma.testResult.deleteMany({ where: { userId: player.id } });
  await prisma.healthEntry.deleteMany({ where: { userId: player.id } });

  const today = new Date(2026, 4, 18);

  // 4. Seed 14 runder siste 90 dager med stigende SG (forbedring)
  const roundsData = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 88 - i * 6 - Math.floor(rand(0, 3));
    const playedAt = addDays(today, -daysAgo);
    const trend = i / 14; // forbedrer seg over tid
    const sgTotal = roundTo(-1.5 + trend * 3 + rand(-1, 1), 2);
    const sgOtt = roundTo(-0.5 + trend * 0.8 + rand(-0.5, 0.5), 2);
    const sgApp = roundTo(-0.4 + trend * 1.1 + rand(-0.6, 0.6), 2);
    const sgArg = roundTo(-0.3 + trend * 0.6 + rand(-0.4, 0.4), 2);
    const sgPutt = roundTo(-0.3 + trend * 0.5 + rand(-0.5, 0.5), 2);
    const score = Math.round(71 - sgTotal * 1.1 + rand(-1, 1));
    return {
      userId: player.id,
      courseId: course!.id,
      playedAt,
      score,
      sgTotal,
      sgOtt,
      sgApp,
      sgArg,
      sgPutt,
      sgTee: roundTo(sgOtt * 0.85, 2),
      sgApp200: roundTo(sgApp * 0.2 + rand(-0.2, 0.2), 2),
      sgApp150: roundTo(sgApp * 0.35 + rand(-0.2, 0.2), 2),
      sgApp100: roundTo(sgApp * 0.3 + rand(-0.15, 0.15), 2),
      sgApp50: roundTo(sgApp * 0.15 + rand(-0.1, 0.1), 2),
      sgChip: roundTo(sgArg * 0.4 + rand(-0.1, 0.1), 2),
      sgPitch: roundTo(sgArg * 0.35 + rand(-0.1, 0.1), 2),
      sgBunker: roundTo(sgArg * 0.15 + rand(-0.05, 0.05), 2),
      sgPutt0_3: roundTo(sgPutt * 0.45 + rand(-0.1, 0.1), 2),
      sgPutt3_5: roundTo(sgPutt * 0.3 + rand(-0.1, 0.1), 2),
      sgPutt5_10: roundTo(sgPutt * 0.15 + rand(-0.08, 0.08), 2),
      sgPutt10_15: roundTo(sgPutt * 0.07 + rand(-0.05, 0.05), 2),
      notes: i === 13 ? "Sterk sluttrunde — 4 birdies på back-9" : null,
    };
  });
  await prisma.round.createMany({ data: roundsData });
  console.log(`Lagt til ${roundsData.length} runder`);

  // 5. Seed 12 TrackMan-økter siste 60 dager
  const trackmanData = Array.from({ length: 12 }, (_, i) => {
    const daysAgo = 58 - i * 5 - Math.floor(rand(0, 2));
    return {
      userId: player.id,
      recordedAt: addDays(today, -daysAgo),
      source: "csv-import",
      shotCount: Math.round(rand(30, 90)),
      environment: (i % 3 === 0 ? "RANGE_OUTDOOR_GRASS" : "SIMULATOR_INDOOR") as
        | "RANGE_OUTDOOR_GRASS"
        | "SIMULATOR_INDOOR",
    };
  });
  await prisma.trackManSession.createMany({ data: trackmanData });
  console.log(`Lagt til ${trackmanData.length} TrackMan-økter`);

  // 6. Seed 30 dager helse-entries
  const healthData = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, -(29 - i));
    return {
      userId: player.id,
      date,
      restingHr: Math.round(rand(52, 60)),
      sleepHours: roundTo(rand(6.2, 8.4), 1),
      weightKg: roundTo(82 + rand(-1.5, 1.5), 1),
      notes: i === 5 ? "Litt stiv etter lang økt" : null,
    };
  });
  await prisma.healthEntry.createMany({ data: healthData });
  console.log(`Lagt til ${healthData.length} helse-entries`);

  // 7. Seed test-resultater hvis vi har TestDefinitions
  const tests = await prisma.testDefinition.findMany({ take: 6 });
  if (tests.length > 0) {
    const testData = tests.map((t, i) => ({
      userId: player.id,
      testId: t.id,
      takenAt: addDays(today, -((i + 1) * 14)),
      score: roundTo(rand(60, 92), 1),
      notes: null,
    }));
    await prisma.testResult.createMany({ data: testData });
    console.log(`Lagt til ${testData.length} testresultater`);
  } else {
    console.log("Ingen TestDefinitions funnet — hopper over testresultater");
  }

  console.log("\n✓ Anders som spiller er seedet");
  console.log(`  Player ID: ${player.id}`);
  console.log(`  Email: ${player.email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
