/**
 * Seed «Anders Skarpnord» — kanonisk DEMO-spiller for AK Golf HQ.
 *
 * Elite-junior på WANG Toppidrett Fredrikstad. Snittscore 72, 40 timers
 * strukturert trening i uka, mål om å bli verdens beste golfspiller.
 *
 * Idempotent: upserter på email, sletter egen tidligere seed-data først.
 * Gir en KOMPLETT, ekte datagrunnlag slik at hele PlayerHQ + AgencyOS viser
 * reelle tall for denne spilleren (ingen mock).
 *
 * Kjør: npx tsx scripts/seed-anders-skarpnord.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PLAYER_EMAIL = "anders.skarpnord@demo.akgolf.no";
const PLAYER_NAME = "Anders Skarpnord";

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
  console.log("Seeder demospiller Anders Skarpnord...");

  // 1. Opprett/oppdater spilleren — elite-junior, WANG Toppidrett, snitt 72.
  const player = await prisma.user.upsert({
    where: { email: PLAYER_EMAIL },
    update: {
      name: PLAYER_NAME,
      role: "PLAYER",
      tier: "PRO",
      hcp: 1.2,
      playingYears: 11,
      ambition: "Bli verdens beste golfspiller",
      homeClub: "Gamle Fredrikstad GK",
      school: "WANG Toppidrett Fredrikstad",
      prevSeasonAvgScore: 74,
      dateOfBirth: new Date(2008, 3, 12),
      requiresGuardianConsent: false,
      userStatus: "AKTIV",
      avatarUrl: null,
    },
    create: {
      authId: `seed-${randomUUID()}`,
      email: PLAYER_EMAIL,
      name: PLAYER_NAME,
      role: "PLAYER",
      tier: "PRO",
      hcp: 1.2,
      playingYears: 11,
      ambition: "Bli verdens beste golfspiller",
      homeClub: "Gamle Fredrikstad GK",
      school: "WANG Toppidrett Fredrikstad",
      prevSeasonAvgScore: 74,
      dateOfBirth: new Date(2008, 3, 12),
      requiresGuardianConsent: false,
      userStatus: "AKTIV",
    },
  });
  console.log(`Spiller: ${player.id} (${player.email})`);

  // 2. CourseDefinition å koble runder mot.
  let course = await prisma.courseDefinition.findFirst({
    where: { name: "Gamle Fredrikstad GK" },
  });
  if (!course) {
    course = await prisma.courseDefinition.create({
      data: { name: "Gamle Fredrikstad GK", par: 71, rating: 71.4, slope: 124 },
    });
  }

  // 3. Rydd tidligere seed-data for ren idempotent kjøring.
  await prisma.round.deleteMany({ where: { userId: player.id } });
  await prisma.trackManSession.deleteMany({ where: { userId: player.id } });
  await prisma.testResult.deleteMany({ where: { userId: player.id } });
  await prisma.healthEntry.deleteMany({ where: { userId: player.id } });
  await prisma.goal.deleteMany({ where: { userId: player.id } });
  await prisma.trainingPlan.deleteMany({ where: { userId: player.id } });
  await prisma.sgInsight.deleteMany({ where: { userId: player.id } });
  await prisma.clubMetricTrend.deleteMany({ where: { userId: player.id } });

  const today = new Date(2026, 5, 20);

  // 4. 16 runder siste 100 dager — snitt ~72, elite SG, stigende trend.
  const roundsData = Array.from({ length: 16 }, (_, i) => {
    const daysAgo = 98 - i * 6 - Math.floor(rand(0, 3));
    const playedAt = addDays(today, -daysAgo);
    const trend = i / 15; // forbedrer seg mot verdenstoppen
    const sgTotal = roundTo(-0.3 + trend * 2.0 + rand(-0.6, 0.6), 2); // elite, mest positiv
    const sgOtt = roundTo(0.1 + trend * 0.7 + rand(-0.4, 0.4), 2);
    const sgApp = roundTo(0.0 + trend * 0.9 + rand(-0.5, 0.5), 2);
    const sgArg = roundTo(-0.1 + trend * 0.5 + rand(-0.35, 0.35), 2);
    const sgPutt = roundTo(-0.1 + trend * 0.5 + rand(-0.45, 0.45), 2);
    // Snittscore styres mot 72: bedre runder når SG er høy.
    const score = Math.round(72.5 - sgTotal * 0.6 + rand(-1, 1));
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
      notes: i === 15 ? "Banerekord-tangering — 66 (-5). 6 birdies." : null,
    };
  });
  await prisma.round.createMany({ data: roundsData });
  const snitt = roundTo(roundsData.reduce((s, r) => s + r.score, 0) / roundsData.length, 1);
  console.log(`Lagt til ${roundsData.length} runder (snittscore ${snitt})`);

  // 5. Mål — best i verden (OUTCOME) + HCP-mål + 40t/uke (PROCESS).
  await prisma.goal.createMany({
    data: [
      {
        userId: player.id,
        type: "FREE_TEXT",
        category: "OUTCOME",
        title: "Bli verdens beste golfspiller",
        targetDate: new Date(2032, 11, 31),
        status: "ACTIVE",
        payload: { horizon: "karriere" },
      },
      {
        userId: player.id,
        type: "HCP_TARGET",
        category: "OUTCOME",
        title: "Nå +4 i handicap denne sesongen",
        targetValue: 4,
        targetDate: new Date(2026, 9, 1),
        status: "ACTIVE",
      },
      {
        userId: player.id,
        type: "FREE_TEXT",
        category: "PROCESS",
        title: "40 timers strukturert trening hver uke",
        targetValue: 40,
        status: "ACTIVE",
        payload: { unit: "timer/uke" },
      },
    ],
  });
  console.log("Lagt til 3 mål");

  // 6. 14 TrackMan-økter siste 60 dager.
  const trackmanData = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 58 - i * 4 - Math.floor(rand(0, 2));
    return {
      userId: player.id,
      recordedAt: addDays(today, -daysAgo),
      source: "csv-import",
      shotCount: Math.round(rand(40, 110)),
      environment: (i % 3 === 0 ? "RANGE_OUTDOOR_GRASS" : "SIMULATOR_INDOOR") as
        | "RANGE_OUTDOOR_GRASS"
        | "SIMULATOR_INDOOR",
    };
  });
  await prisma.trackManSession.createMany({ data: trackmanData });
  console.log(`Lagt til ${trackmanData.length} TrackMan-økter`);

  // 7. 30 dager helse — elite resting HR + søvn.
  const healthData = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, -(29 - i));
    return {
      userId: player.id,
      date,
      restingHr: Math.round(rand(42, 50)),
      sleepHours: roundTo(rand(7.4, 9.0), 1),
      weightKg: roundTo(74 + rand(-1.0, 1.0), 1),
      notes: i === 12 ? "Toppform — full restitusjon" : null,
    };
  });
  await prisma.healthEntry.createMany({ data: healthData });
  console.log(`Lagt til ${healthData.length} helse-entries`);

  // 8. Testresultater (elite-nivå) hvis TestDefinitions finnes.
  const tests = await prisma.testDefinition.findMany({ take: 8 });
  if (tests.length > 0) {
    const testData = tests.map((t, i) => ({
      userId: player.id,
      testId: t.id,
      takenAt: addDays(today, -((i + 1) * 10)),
      score: roundTo(rand(78, 96), 1),
      notes: null,
    }));
    await prisma.testResult.createMany({ data: testData });
    console.log(`Lagt til ${testData.length} testresultater`);
  } else {
    console.log("Ingen TestDefinitions — hopper over tester");
  }

  // 9. Shots på de siste 4 rundene (realistisk 18-hulls fordeling).
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
      const shotsOnHole = Math.max(2, baseShots + (Math.random() < 0.25 ? 1 : 0) - (Math.random() < 0.22 ? 1 : 0));
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
          distanceHit = par === 3 ? rand(150, 185) : rand(260, 305);
          distanceToPin = par === 3 ? rand(6, 20) : rand(70, 160);
        } else if (s === shotsOnHole && distanceToPin && distanceToPin < 40) {
          club = "Putter";
          lie = "GREEN";
          shotType = "PUTT";
          distanceHit = rand(1, 6);
          distanceToPin = 0;
        } else if (s === shotsOnHole - 1 || s === shotsOnHole) {
          club = "Putter";
          lie = "GREEN";
          shotType = "PUTT";
          distanceHit = rand(1, 10);
          distanceToPin = rand(0, 3);
        } else {
          club = ["5i", "7i", "9i", "PW", "GW", "SW"][Math.floor(rand(0, 6))];
          lie = (["FAIRWAY", "FAIRWAY", "FAIRWAY", "SEMI_ROUGH", "ROUGH"] as const)[Math.floor(rand(0, 5))];
          shotType = "APPROACH";
          distanceHit = rand(80, 190);
          distanceToPin = rand(3, 40);
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

  // 10. TrainingPlan — 40 timers uke: 4 uker × 8 økter (~40t/uke total varighet).
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: player.id,
      name: "Toppidrett — verdenstopp-progresjon 2026",
      startDate: addDays(today, -28),
      endDate: addDays(today, 28),
      isActive: true,
      status: "ACTIVE",
    },
  });
  type SessInput = {
    planId: string;
    scheduledAt: Date;
    durationMin: number;
    title: string;
    pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
    skillArea: "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL";
    environment: "RANGE" | "BANE" | "STUDIO" | "HJEM" | "SIMULATOR";
    lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
    pressureLevel: "PR1" | "PR2" | "PR3" | "PR4" | "PR5";
  };
  const sessionsInput: SessInput[] = [];
  // Ukemal: 10 økter = 2400 min = 40 t/uke (elite-junior full treningsuke).
  const ukeMal: Array<{ dur: number; pyr: SessInput["pyramidArea"]; skill: SessInput["skillArea"]; env: SessInput["environment"] }> = [
    { dur: 300, pyr: "TEK", skill: "TEE_TOTAL", env: "STUDIO" },
    { dur: 180, pyr: "SLAG", skill: "TILNAERMING", env: "RANGE" },
    { dur: 360, pyr: "SPILL", skill: "SPILL", env: "BANE" },
    { dur: 180, pyr: "FYS", skill: "TEE_TOTAL", env: "HJEM" },
    { dur: 120, pyr: "SLAG", skill: "PUTTING", env: "STUDIO" },
    { dur: 240, pyr: "SLAG", skill: "AROUND_GREEN", env: "RANGE" },
    { dur: 300, pyr: "TEK", skill: "TILNAERMING", env: "SIMULATOR" },
    { dur: 360, pyr: "TURN", skill: "SPILL", env: "BANE" },
    { dur: 180, pyr: "FYS", skill: "TEE_TOTAL", env: "HJEM" },
    { dur: 180, pyr: "SLAG", skill: "PUTTING", env: "RANGE" },
  ];
  const lphaseRoll: SessInput["lPhase"][] = ["GRUNN", "GRUNN", "SPESIAL", "SPESIAL", "TURNERING", "TURNERING"];
  for (let week = 0; week < 4; week++) {
    ukeMal.forEach((m, j) => {
      const idx = week * ukeMal.length + j;
      sessionsInput.push({
        planId: plan.id,
        scheduledAt: addDays(today, -24 + week * 7 + j),
        durationMin: m.dur,
        title: `${m.skill} — ${m.pyr}`,
        pyramidArea: m.pyr,
        skillArea: m.skill,
        environment: m.env,
        lPhase: lphaseRoll[idx % lphaseRoll.length],
        pressureLevel: (["PR2", "PR3", "PR3", "PR4", "PR4", "PR5"][idx % 6]) as SessInput["pressureLevel"],
      });
    });
  }
  await prisma.trainingPlanSession.createMany({ data: sessionsInput });
  const timerPerUke = roundTo(ukeMal.reduce((s, m) => s + m.dur, 0) / 60, 0);
  console.log(`Lagt til ${sessionsInput.length} økter (~${timerPerUke} t/uke)`);

  // 11. SG-innsikt (elite-fokusert).
  await prisma.sgInsight.createMany({
    data: [
      {
        userId: player.id,
        category: "PROGRESSION_TREND",
        severity: 1,
        title: "SG Total opp 2,3 slag på 10 uker",
        body: "Du har gått fra -0,3 til +2,0 SG total siden mars. Tilnærming driver mest av framgangen.",
        payload: { metric: "sgTotal", from: -0.3, to: 2.0 },
      },
      {
        userId: player.id,
        category: "STRIKE_QUALITY",
        severity: 2,
        title: "Driver-smash på verdensklasse-nivå",
        body: "Smash 1,49-1,50 jevnt på driver. Hold ballhastighet over 165 mph mot turneringssesong.",
        payload: { club: "Driver", smashMin: 1.49, smashMax: 1.5 },
      },
      {
        userId: player.id,
        category: "TRAINING_GAP",
        severity: 3,
        title: "Putting under 3 m kan løftes",
        body: "SG putt 0-3 m ligger flatt. Legg inn 3-6-9-protokollen 3x/uke for å nå Tour-nivå.",
        payload: { area: "PUTTING", band: "0-3m" },
      },
      {
        userId: player.id,
        category: "SAME_DISTANCE_OPPORTUNITY",
        severity: 2,
        title: "150 m-kontroll er svært stabil",
        body: "Club path-variasjon under 1,8° på 150 m — bedre enn de fleste touring-proffer. Bevar dette.",
        payload: { distance: 150, clubPathStdDev: 1.8 },
      },
    ],
  });
  console.log("Lagt til 4 SG-innsikter");

  // 12. ClubMetricTrend (alle køller × 6 uker) — elite-distanser.
  const clubs = ["Driver", "3w", "5w", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW"];
  const metricsInput = clubs.flatMap((club) =>
    Array.from({ length: 6 }, (_, w) => {
      const week = 5 - w;
      const baseTotal = club === "Driver" ? 295 : club === "3w" ? 260 : club === "5w" ? 240 : 220 - clubs.indexOf(club) * 9;
      return {
        userId: player.id,
        club,
        weekStart: addDays(today, -week * 7),
        avgClubPath: roundTo(rand(-1.8, 1.8), 2),
        avgFaceAngle: roundTo(rand(-1.5, 1.5), 2),
        avgSmash: roundTo(club === "Driver" ? rand(1.48, 1.5) : rand(1.36, 1.44), 3),
        avgTotal: roundTo(baseTotal + rand(-4, 4), 1),
        sigmaBall: roundTo(rand(1.8, 4.5), 1),
        shotCount: Math.round(rand(30, 95)),
      };
    }),
  );
  await prisma.clubMetricTrend.createMany({ data: metricsInput });
  console.log(`Lagt til ${metricsInput.length} club metric trends`);

  console.log("\n✓ Anders Skarpnord er seedet som komplett demospiller");
  console.log(`  Player ID: ${player.id}`);
  console.log(`  Email: ${player.email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
