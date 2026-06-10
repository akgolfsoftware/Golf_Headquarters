/**
 * Seed: Pulje B-innhold for AgencyOS (Alle spillere · Spiller-detalj · Grupper).
 *
 * Gir de 5 navngitte demo-spillerne på *@stall.akgolf.test ekte innhold slik
 * at /admin/spillere, /admin/spillere/[id] og /admin/grupper viser data i
 * stedet for tomtilstander:
 *
 *  - Aktiv 12-ukers treningsplan per spiller (startet for ~6 uker siden),
 *    48 økter med FYS/TEK/SLAG/SPILL/TURN-fordeling. Passerte økter COMPLETED.
 *  - Øyvind Rohjan: «Srixon-oppkjøring · stall-demo» + 2 PLANNED-økter
 *    tidligere denne uka → «2 økter bak» i tabellen + coach-flagg på detalj.
 *  - Runder m/ SG (6 for Øyvind/Sofie/Karl, 3 for Emilie/Mia) mot
 *    eksisterende CourseDefinition, scores rundt HCP.
 *  - 6 BrukerSgInput per spiller (SG-kolonnens foretrukne sparkline-kilde).
 *  - Øyvind ekstra: dateOfBirth (2009 → 17 år), TournamentEntry «Srixon
 *    Tour #2» (+11 dg, «dg til»-meta) og 3 TestResults (plassholder-tall —
 *    FYS-resultatformel er ikke låst).
 *
 * Idempotent: egne rader er merket gjenkjennbart («· stall-demo» i plan-navn,
 * "stall-demo" i notes/kommentar) og slettes/gjenskapes ved hver kjøring.
 * Rører ALDRI screentest@akgolf.test eller rader uten markør.
 *
 * Kjør: npx tsx scripts/seed-stall-detalj.ts
 */

import "./_env";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const MARKER = "stall-demo";
const PLAN_SUFFIX = " · stall-demo";
const DOMAIN = "stall.akgolf.test";

// ---------- Dato-hjelpere ----------

function daysAgo(n: number, h = 10, m = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Mandag 00:00 i inneværende ISO-uke (samme regnestykke som admin-sidene). */
function startOfIsoWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function addDays(base: Date, n: number, h?: number, m = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  if (h != null) d.setHours(h, m, 0, 0);
  return d;
}

/** SG-total → grov fordeling per kategori (2 desimaler). */
function sgSplit(total: number): { sgOtt: number; sgApp: number; sgArg: number; sgPutt: number } {
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { sgOtt: r2(total * 0.25), sgApp: r2(total * 0.35), sgArg: r2(total * 0.2), sgPutt: r2(total * 0.2) };
}

// ---------- Spiller-spesifikasjon ----------

type PyrArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

type PlayerSpec = {
  email: string;
  planName: string;
  /** "oslo" → Oslo Golfklubb, "gfgk" → Gamle Fredrikstad GK. */
  course: "oslo" | "gfgk";
  /** Dager siden per runde (eldst → nyest). */
  roundOffsets: number[];
  /** Score relativt til par per runde (samme rekkefølge). */
  scoreDiffs: number[];
  /** sgTotal per runde (samme rekkefølge). */
  roundSg: number[];
  /** 6 ukentlige BrukerSgInput-punkter (eldst → nyest). */
  sgTrend: number[];
};

const SPECS: PlayerSpec[] = [
  {
    email: `oyvind-rohjan@${DOMAIN}`,
    planName: `Srixon-oppkjøring${PLAN_SUFFIX}`,
    course: "oslo",
    roundOffsets: [35, 28, 21, 14, 7, 3],
    scoreDiffs: [4, 3, 2, 3, 1, -2],
    roundSg: [-1.6, -0.9, -0.4, -0.8, 0.3, 1.2],
    sgTrend: [-1.6, -0.9, -0.4, -0.8, 0.3, 1.2],
  },
  {
    email: `sofie-kvam@${DOMAIN}`,
    planName: `Sommerplan 12 uker${PLAN_SUFFIX}`,
    course: "gfgk",
    roundOffsets: [36, 29, 22, 15, 8, 4],
    scoreDiffs: [3, 2, 3, 1, 0, -1],
    roundSg: [-0.8, -0.2, -0.6, 0.4, 0.9, 1.3],
    sgTrend: [-0.8, -0.2, -0.6, 0.4, 0.9, 1.3],
  },
  {
    email: `karl-ludvig@${DOMAIN}`,
    planName: `NM-oppkjøring${PLAN_SUFFIX}`,
    course: "gfgk",
    roundOffsets: [34, 27, 20, 13, 6, 2],
    scoreDiffs: [1, 0, 1, -1, -2, -3],
    roundSg: [0.2, 0.6, 0.3, 1.0, 1.4, 1.9],
    sgTrend: [0.2, 0.6, 0.3, 1.0, 1.4, 1.9],
  },
  {
    email: `emilie-borg@${DOMAIN}`,
    planName: `Teknisk blokk${PLAN_SUFFIX}`,
    course: "gfgk",
    roundOffsets: [28, 14, 5],
    scoreDiffs: [5, 3, 2],
    roundSg: [-1.9, -0.7, -0.2],
    sgTrend: [0.3, -0.2, -0.6, -0.4, -0.1, 0.1],
  },
  {
    email: `mia-nilsen@${DOMAIN}`,
    planName: `Turneringssesong${PLAN_SUFFIX}`,
    course: "gfgk",
    roundOffsets: [26, 12, 4],
    scoreDiffs: [2, 0, -1],
    roundSg: [-0.3, 0.6, 1.1],
    sgTrend: [-0.3, 0.1, 0.4, 0.2, 0.8, 1.1],
  },
];

const OYVIND_EMAIL = `oyvind-rohjan@${DOMAIN}`;

/** Ukentlig økt-mønster: dag-offset fra mandag + klokkeslett + pyramide-område. */
const WEEK_PATTERN: Array<{ dow: number; h: number; area: PyrArea; title: string; dur: number }> = [
  { dow: 0, h: 17, area: "TEK", title: "Teknisk blokk · P5–P6", dur: 90 },
  { dow: 1, h: 17, area: "SLAG", title: "Wedge-avstander 50–80 m", dur: 60 },
  { dow: 3, h: 17, area: "FYS", title: "Styrke + mobilitet", dur: 60 },
  { dow: 5, h: 10, area: "SPILL", title: "9 hull på banen", dur: 120 },
];

// Øyvinds tester (plassholder-score — FYS-resultatformel er IKKE låst).
const OYVIND_TESTS: Array<{ name: string; score: number; daysAgo: number }> = [
  { name: "8-ball Blocked", score: 5.6, daysAgo: 21 },
  { name: "9 hull lengde", score: 38, daysAgo: 10 },
  { name: "Balanse 30 sek", score: 27, daysAgo: 4 },
];

// ---------- Main ----------

async function main() {
  console.log("Seeder Pulje B-demo-innhold (stall-detalj)...\n");
  const now = new Date();
  const ukeStart = startOfIsoWeek(now);
  // Plan startet for ~6 uker siden (mandag), varer 12 uker.
  const planStart = addDays(ukeStart, -42, 0);
  const planEnd = addDays(planStart, 84, 0);

  // 1. Spillere (må finnes fra seed-screentest-coach.ts)
  const users = await prisma.user.findMany({
    where: { email: { in: SPECS.map((s) => s.email) } },
    select: { id: true, email: true, name: true, hcp: true },
  });
  const byEmail = new Map(users.map((u) => [u.email, u]));
  const missing = SPECS.filter((s) => !byEmail.has(s.email));
  if (missing.length > 0) {
    throw new Error(
      `Mangler spillere: ${missing.map((m) => m.email).join(", ")} — kjør scripts/seed-screentest-coach.ts først.`,
    );
  }
  const userIds = users.map((u) => u.id);

  // 2. Baner — gjenbruk eksisterende CourseDefinition
  const oslo =
    (await prisma.courseDefinition.findFirst({ where: { name: "Oslo Golfklubb" } })) ??
    (await prisma.courseDefinition.findFirst({ where: { name: { contains: "Oslo" } } })) ??
    (await prisma.courseDefinition.create({ data: { name: "Oslo Golfklubb", par: 72, rating: 73.1, slope: 129 } }));
  const gfgk =
    (await prisma.courseDefinition.findFirst({ where: { name: "Gamle Fredrikstad GK" } })) ??
    (await prisma.courseDefinition.findFirst({ where: { name: { contains: "Fredrikstad" } } })) ??
    (await prisma.courseDefinition.create({ data: { name: "Gamle Fredrikstad GK", par: 72, rating: 72.3, slope: 126 } }));
  const courseOf = { oslo, gfgk } as const;
  console.log(`Baner: ${oslo.name} (par ${oslo.par}) · ${gfgk.name} (par ${gfgk.par})`);

  // 3. Idempotent opprydding — KUN egne markerte rader på de 5 spillerne
  const [delPlans, delRounds, delSg, delTests, delEntries] = await Promise.all([
    prisma.trainingPlan.deleteMany({ where: { userId: { in: userIds }, name: { endsWith: PLAN_SUFFIX } } }),
    prisma.round.deleteMany({ where: { userId: { in: userIds }, notes: { contains: MARKER } } }),
    prisma.brukerSgInput.deleteMany({ where: { userId: { in: userIds }, kommentar: MARKER } }),
    prisma.testResult.deleteMany({ where: { userId: { in: userIds }, notes: MARKER } }),
    prisma.tournamentEntry.deleteMany({ where: { userId: { in: userIds }, notes: MARKER } }),
  ]);
  console.log(
    `Ryddet egne rader: ${delPlans.count} planer · ${delRounds.count} runder · ${delSg.count} sgInputs · ${delTests.count} tester · ${delEntries.count} turneringer\n`,
  );

  // 4. Per spiller: plan + økter, runder, SG-inputs
  for (const spec of SPECS) {
    const user = byEmail.get(spec.email)!;
    const isOyvind = spec.email === OYVIND_EMAIL;

    // 4a. Aktiv 12-ukers plan
    const plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: spec.planName,
        startDate: planStart,
        endDate: planEnd,
        isActive: true,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    // 4b. Økter: 12 uker × 4, hver 3. uke får lørdagen TURN i stedet for SPILL.
    const sessions: Prisma.TrainingPlanSessionCreateManyInput[] = [];
    for (let w = 0; w < 12; w++) {
      const monday = addDays(planStart, w * 7, 0);
      for (const p of WEEK_PATTERN) {
        const turnWeek = w % 3 === 2 && p.dow === 5;
        const scheduledAt = addDays(monday, p.dow, p.h);
        sessions.push({
          planId: plan.id,
          scheduledAt,
          durationMin: p.dur,
          title: turnWeek ? "Turneringsforberedelse · spillplan" : p.title,
          pyramidArea: turnWeek ? "TURN" : p.area,
          status: scheduledAt < now ? "COMPLETED" : "PLANNED",
        });
      }
    }

    // 4c. Øyvind: 2 PLANNED-økter TIDLIGERE denne uka → «2 økter bak».
    // Klemt mellom ukestart og nå så det virker uansett kjøretidspunkt.
    if (isOyvind) {
      const behindA = new Date(Math.max(ukeStart.getTime(), now.getTime() - 26 * 3_600_000));
      let behindB = new Date(Math.max(ukeStart.getTime() + 30 * 60_000, now.getTime() - 3 * 3_600_000));
      if (behindB.getTime() >= now.getTime()) behindB = new Date(now.getTime() - 5 * 60_000);
      sessions.push(
        {
          planId: plan.id,
          scheduledAt: behindA,
          durationMin: 60,
          title: "Innspill 50–80 m · presisjon",
          pyramidArea: "SLAG",
          status: "PLANNED",
        },
        {
          planId: plan.id,
          scheduledAt: behindB,
          durationMin: 45,
          title: "Putt-konsistens 4 m · test",
          pyramidArea: "TEK",
          status: "PLANNED",
        },
      );
    }
    await prisma.trainingPlanSession.createMany({ data: sessions });

    // 4d. Runder med SG mot banens par
    const course = courseOf[spec.course];
    const rounds: Prisma.RoundCreateManyInput[] = spec.roundOffsets.map((off, i) => {
      const sgTotal = spec.roundSg[i];
      const last = i === spec.roundOffsets.length - 1;
      return {
        userId: user.id,
        courseId: course.id,
        playedAt: daysAgo(off, 10),
        score: course.par + spec.scoreDiffs[i],
        sgTotal,
        ...sgSplit(sgTotal),
        notes: last && isOyvind ? `Sterk avslutning — 3 birdies på back-9 · ${MARKER}` : MARKER,
      };
    });
    await prisma.round.createMany({ data: rounds });

    // 4e. 6 ukentlige SG-inputs (foretrukket sparkline-kilde i /admin/spillere)
    const sgOffsets = [35, 28, 21, 14, 7, 2];
    await prisma.brukerSgInput.createMany({
      data: spec.sgTrend.map((sgTotal, i) => ({
        userId: user.id,
        dato: daysAgo(sgOffsets[i], 12),
        sgTotal,
        ...sgSplit(sgTotal),
        antallRunder: 1,
        kilde: "PLAYERHQ",
        kommentar: MARKER,
      })),
    });

    console.log(
      `${user.name}: plan «${spec.planName}» (${sessions.length} økter) · ${rounds.length} runder · ${spec.sgTrend.length} SG-punkter`,
    );
  }

  // 5. Øyvind ekstra: fødselsdato (17 år), siste innlogging, turnering, tester
  const oyvind = byEmail.get(OYVIND_EMAIL)!;
  await prisma.user.update({
    where: { id: oyvind.id },
    data: { dateOfBirth: new Date(2009, 2, 14), lastLoginAt: daysAgo(1, 19, 30) },
  });

  await prisma.tournamentEntry.create({
    data: {
      userId: oyvind.id,
      manualName: "Srixon Tour #2",
      manualDate: daysAgo(-11, 8),
      category: "Srixon Tour",
      priority: "NORMAL",
      entryStatus: "CONFIRMED",
      notes: MARKER,
    },
  });

  let seededTests = 0;
  for (const t of OYVIND_TESTS) {
    const def = await prisma.testDefinition.findFirst({ where: { name: t.name }, select: { id: true } });
    if (!def) {
      console.warn(`  TestDefinition «${t.name}» finnes ikke — hopper over.`);
      continue;
    }
    await prisma.testResult.create({
      data: { userId: oyvind.id, testId: def.id, takenAt: daysAgo(t.daysAgo, 16), score: t.score, notes: MARKER },
    });
    seededTests++;
  }
  console.log(`Øyvind ekstra: fødselsdato 14.03.2009 · turnering «Srixon Tour #2» (+11 dg) · ${seededTests} testresultater\n`);

  // ---------- Verifikasjon ----------
  console.log("── Verifikasjon ──");
  for (const spec of SPECS) {
    const user = byEmail.get(spec.email)!;
    const [plans, okter, runder, sgInputs] = await Promise.all([
      prisma.trainingPlan.count({ where: { userId: user.id, isActive: true, name: { endsWith: PLAN_SUFFIX } } }),
      prisma.trainingPlanSession.count({ where: { plan: { userId: user.id, name: { endsWith: PLAN_SUFFIX } } } }),
      prisma.round.count({ where: { userId: user.id, notes: { contains: MARKER } } }),
      prisma.brukerSgInput.count({ where: { userId: user.id, kommentar: MARKER } }),
    ]);
    console.log(`${user.name.padEnd(16)} aktiv plan: ${plans} · økter: ${okter} · runder: ${runder} · sgInputs: ${sgInputs}`);
  }

  const behind = await prisma.trainingPlanSession.count({
    where: {
      plan: { userId: oyvind.id },
      scheduledAt: { gte: ukeStart, lt: new Date() },
      status: "PLANNED",
    },
  });
  const [oyTests, oyEntries, oyUser] = await Promise.all([
    prisma.testResult.count({ where: { userId: oyvind.id, notes: MARKER } }),
    prisma.tournamentEntry.count({ where: { userId: oyvind.id, notes: MARKER } }),
    prisma.user.findUnique({ where: { id: oyvind.id }, select: { dateOfBirth: true } }),
  ]);
  console.log(`\nØyvind «økter bak» denne uka: ${behind}  (mål: 2)`);
  console.log(`Øyvind tester: ${oyTests} · turneringer: ${oyEntries} · født: ${oyUser?.dateOfBirth?.toISOString().slice(0, 10)}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
