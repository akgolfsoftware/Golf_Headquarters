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

  // 8. Slett tidligere training plan, shots, insights, club-metrics for ren seed
  await prisma.trainingPlan.deleteMany({ where: { userId: player.id } });
  await prisma.sgInsight.deleteMany({ where: { userId: player.id } });
  await prisma.clubMetricTrend.deleteMany({ where: { userId: player.id } });

  // 9. Seed shots per round (realistisk 18-hulls fordeling)
  const allRounds = await prisma.round.findMany({ where: { userId: player.id } });
  type ShotInput = {
    roundId: string;
    holeNumber: number;
    holePar: number;
    shotNumber: number;
    club: string | null;
    lie: "TEE" | "FAIRWAY" | "SEMI_ROUGH" | "ROUGH" | "BUNKER" | "GREEN";
    distanceToPin: number | null;
    distanceHit: number | null;
    shotType: "DRIVE" | "APPROACH" | "CHIP" | "PITCH" | "PUTT" | "BUNKER";
  };
  const shotsInput: ShotInput[] = [];
  for (const round of allRounds.slice(-4)) {
    for (let hole = 1; hole <= 18; hole++) {
      const par = hole % 5 === 0 ? 5 : hole % 3 === 0 ? 3 : 4;
      const baseShots = par === 3 ? 3 : par === 5 ? 5 : 4;
      const shotsOnHole = Math.max(2, baseShots + (Math.random() < 0.3 ? 1 : 0) - (Math.random() < 0.15 ? 1 : 0));

      for (let s = 1; s <= shotsOnHole; s++) {
        let club: string | null = null;
        let lie: ShotInput["lie"] = "TEE";
        let shotType: ShotInput["shotType"] = "DRIVE";
        let distanceToPin: number | null = null;
        let distanceHit: number | null = null;

        if (s === 1) {
          club = par === 3 ? "7i" : "Driver";
          lie = "TEE";
          shotType = par === 3 ? "APPROACH" : "DRIVE";
          distanceHit = par === 3 ? rand(140, 170) : rand(240, 290);
          distanceToPin = par === 3 ? rand(8, 25) : rand(80, 180);
        } else if (s === shotsOnHole && distanceToPin && distanceToPin < 40) {
          club = "Putter";
          lie = "GREEN";
          shotType = "PUTT";
          distanceHit = rand(1, 8);
          distanceToPin = 0;
        } else if (s === shotsOnHole - 1 || s === shotsOnHole) {
          club = "Putter";
          lie = "GREEN";
          shotType = "PUTT";
          distanceHit = rand(1, 12);
          distanceToPin = rand(0, 4);
        } else {
          club = ["5i", "7i", "9i", "PW", "GW", "SW"][Math.floor(rand(0, 6))];
          lie = (["FAIRWAY", "FAIRWAY", "FAIRWAY", "SEMI_ROUGH", "ROUGH"] as const)[Math.floor(rand(0, 5))];
          shotType = "APPROACH";
          distanceHit = rand(70, 180);
          distanceToPin = rand(5, 50);
        }

        shotsInput.push({
          roundId: round.id,
          holeNumber: hole,
          holePar: par,
          shotNumber: s,
          club,
          lie,
          distanceToPin: distanceToPin !== null ? roundTo(distanceToPin, 1) : null,
          distanceHit: distanceHit !== null ? roundTo(distanceHit, 1) : null,
          shotType,
        });
      }
    }
  }
  await prisma.shot.createMany({ data: shotsInput });
  console.log(`Lagt til ${shotsInput.length} shots over 4 runder`);

  // 10. Seed TrainingPlan med 12 sessions (4 uker × 3 økter)
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: player.id,
      name: "Vår-progresjon 2026",
      startDate: addDays(today, -28),
      endDate: addDays(today, 28),
      isActive: true,
      status: "ACTIVE",
    },
  });

  const sessionsInput: Array<{
    planId: string;
    scheduledAt: Date;
    durationMin: number;
    title: string;
    pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
    skillArea: "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL";
    environment: "RANGE" | "BANE" | "STUDIO" | "HJEM" | "SIMULATOR";
    lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
    pressureLevel: "PR1" | "PR2" | "PR3" | "PR4" | "PR5";
  }> = [];
  const pyramidRoll: Array<"FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"> = ["TEK", "SLAG", "SPILL", "TEK", "FYS", "SLAG", "SPILL", "TURN", "TEK", "SLAG", "SPILL", "TURN"];
  const skillRoll: Array<"TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL"> = ["TEE_TOTAL", "TILNAERMING", "PUTTING", "AROUND_GREEN", "TEE_TOTAL", "TILNAERMING", "PUTTING", "SPILL", "TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING"];
  const lphaseRoll: Array<"GRUNN" | "SPESIAL" | "TURNERING"> = ["GRUNN", "GRUNN", "GRUNN", "GRUNN", "SPESIAL", "SPESIAL", "SPESIAL", "SPESIAL", "TURNERING", "TURNERING", "TURNERING", "TURNERING"];

  for (let i = 0; i < 12; i++) {
    sessionsInput.push({
      planId: plan.id,
      scheduledAt: addDays(today, -24 + i * 4),
      durationMin: [60, 90, 120][i % 3],
      title: `Økt ${i + 1} — ${skillRoll[i]}`,
      pyramidArea: pyramidRoll[i],
      skillArea: skillRoll[i],
      environment: (["RANGE", "BANE", "STUDIO", "SIMULATOR"][i % 4]) as "RANGE" | "BANE" | "STUDIO" | "SIMULATOR",
      lPhase: lphaseRoll[i],
      pressureLevel: (["PR2", "PR3", "PR3", "PR4", "PR4", "PR5"][i % 6]) as "PR2" | "PR3" | "PR4" | "PR5",
    });
  }
  await prisma.trainingPlanSession.createMany({ data: sessionsInput });
  console.log(`Lagt til ${sessionsInput.length} planlagte økter`);

  // 11. Seed SgInsight (5-8 stk)
  const insightsInput: Array<{
    userId: string;
    category:
      | "DISTANCE_GAPPING"
      | "CONSISTENCY_LEAK"
      | "TRAINING_GAP"
      | "STRIKE_QUALITY"
      | "PROGRESSION_TREND"
      | "SAME_DISTANCE_OPPORTUNITY";
    severity: number;
    title: string;
    body: string;
    payload: object;
  }> = [
    {
      userId: player.id,
      category: "DISTANCE_GAPPING",
      severity: 4,
      title: "Gap mellom 8i og PW",
      body: "Du har et 25m gap mellom 8-jern og PW (135m → 110m). Spillere på ditt nivå bør ha jevnere distansegapping.",
      payload: { from: "8i", to: "PW", gapMeters: 25, recommendedMax: 15 },
    },
    {
      userId: player.id,
      category: "PROGRESSION_TREND",
      severity: 2,
      title: "Putt fra 5-10 ft forbedrer seg",
      body: "Du har gått fra -0.15 til +0.22 SG på putt 5-10 ft de siste 4 ukene. Fortsett med 3-6-9-protokollen.",
      payload: { metric: "sgPutt5_10", from: -0.15, to: 0.22 },
    },
    {
      userId: player.id,
      category: "TRAINING_GAP",
      severity: 3,
      title: "For lite Around-Green denne måneden",
      body: "Kun 8% av treningstid på AROUND_GREEN, anbefalt 15-20%. Legg til 2 chip-økter neste uke.",
      payload: { area: "AROUND_GREEN", current: 8, target: 18 },
    },
    {
      userId: player.id,
      category: "STRIKE_QUALITY",
      severity: 3,
      title: "Smash factor varierer på driver",
      body: "Smash 1.47-1.51 — bør være jevnere 1.49-1.50. Sjekk strikeplassering på siste 50 driver-slag.",
      payload: { club: "Driver", smashMin: 1.47, smashMax: 1.51 },
    },
    {
      userId: player.id,
      category: "SAME_DISTANCE_OPPORTUNITY",
      severity: 2,
      title: "Samme distanse, ulike club paths",
      body: "150m-slag har club path-variasjon på 4.2°. Spillere på ditt nivå har under 2°.",
      payload: { distance: 150, clubPathStdDev: 4.2 },
    },
  ];
  await prisma.sgInsight.createMany({ data: insightsInput });
  console.log(`Lagt til ${insightsInput.length} SG-insights`);

  // 12. Seed ClubMetricTrend (alle køller × siste 6 uker)
  const clubs = ["Driver", "3w", "5w", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW"];
  const metricsInput: Array<{
    userId: string;
    club: string;
    weekStart: Date;
    avgClubPath: number;
    avgFaceAngle: number;
    avgSmash: number;
    avgTotal: number;
    sigmaBall: number;
    shotCount: number;
  }> = [];
  for (const club of clubs) {
    for (let week = 5; week >= 0; week--) {
      const baseTotal = club === "Driver" ? 265 : club === "3w" ? 235 : club === "5w" ? 215 : 200 - clubs.indexOf(club) * 9;
      metricsInput.push({
        userId: player.id,
        club,
        weekStart: addDays(today, -week * 7),
        avgClubPath: roundTo(rand(-2.5, 2.5), 2),
        avgFaceAngle: roundTo(rand(-2, 2), 2),
        avgSmash: roundTo(club === "Driver" ? rand(1.46, 1.5) : rand(1.32, 1.42), 3),
        avgTotal: roundTo(baseTotal + rand(-5, 5), 1),
        sigmaBall: roundTo(rand(2.5, 6.5), 1),
        shotCount: Math.round(rand(20, 80)),
      });
    }
  }
  await prisma.clubMetricTrend.createMany({ data: metricsInput });
  console.log(`Lagt til ${metricsInput.length} club metric trends`);

  console.log("\n✓ Anders som spiller er seedet");
  console.log(`  Player ID: ${player.id}`);
  console.log(`  Email: ${player.email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
