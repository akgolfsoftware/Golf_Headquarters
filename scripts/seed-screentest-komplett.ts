/**
 * Komplett demo-datapåfyll for screentest@akgolf.test (Øyvind Rohjan) — fyller
 * hullene identifisert i skjerm-kartleggingen (analysere/TrackMan/runder/trening,
 * mål, tester, fysisk, utviklingsplan, datagolf, booking, workbench, innboks).
 *
 * SCOPE: KUN screentest@akgolf.test sine egne rader (+ coach-relasjoner mot
 * coachtest@akgolf.test) + 3 globale InnboksEpost. Rører ALDRI andre brukeres data.
 *
 * Idempotent: sletter egne rader (scoped på userId/ownerId/loggedBy/playerId) før
 * gjenskaping, eller upsert på unike nøkler. Datoer regnes RELATIVT til kjøredato.
 *
 * Kjør: npx tsx scripts/seed-screentest-komplett.ts
 */

import "./_env";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const OYVIND_EMAIL = "screentest@akgolf.test";
const ANDERS_EMAIL = "coachtest@akgolf.test";

const NOW = new Date();

// ---------- Hjelpefunksjoner ----------

function daysAgo(n: number, h = 10, m = 0): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
}
function addDays(base: Date, n: number, h?: number, m = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  if (h != null) d.setHours(h, m, 0, 0);
  return d;
}
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function roundTo(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}
/** Mandag 00:00 i inneværende ISO-uke. */
function startOfIsoWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/** ISO 8601-ukenummer (1-52/53). */
function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** 0=mandag .. 6=søndag */
function isoDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Fordel (score - coursePar) på 18 hull, klemt -2..+4 per hull. */
function distributeHoleDiffs(targetDiff: number): number[] {
  const diffs = Array(18).fill(0);
  let remaining = targetDiff;
  const order = Array.from({ length: 18 }, (_, i) => i).sort(() => rand(-1, 1));
  let guard = 0;
  while (remaining !== 0 && guard < 400) {
    const hole = order[guard % 18];
    const step = remaining > 0 ? 1 : -1;
    if ((step === 1 && diffs[hole] < 4) || (step === -1 && diffs[hole] > -2)) {
      diffs[hole] += step;
      remaining -= step;
    }
    guard++;
  }
  return diffs;
}

const PAR18 = [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4]; // sum 72

/** SG-total → grov fordeling OTT/APP/ARG/PUTT (2 desimaler). */
function sgSplit(total: number): { sgOtt: number; sgApp: number; sgArg: number; sgPutt: number } {
  return {
    sgOtt: roundTo(total * 0.25, 2),
    sgApp: roundTo(total * 0.35, 2),
    sgArg: roundTo(total * 0.2, 2),
    sgPutt: roundTo(total * 0.2, 2),
  };
}

async function main() {
  console.log("Seeder komplett demo-data for screentest@akgolf.test...\n");

  const oyvind = await prisma.user.findUnique({ where: { email: OYVIND_EMAIL } });
  const anders = await prisma.user.findUnique({ where: { email: ANDERS_EMAIL } });
  if (!oyvind) throw new Error(`Fant ikke ${OYVIND_EMAIL} — kjør scripts/seed-screentest.ts først.`);
  if (!anders) throw new Error(`Fant ikke ${ANDERS_EMAIL} — kjør scripts/seed-natt-brukere-auth-bolge.ts først.`);
  console.log(`Spiller: ${oyvind.name} (${oyvind.id})`);
  console.log(`Coach:   ${anders.name} (${anders.id})\n`);

  const counts: Record<string, number> = {};
  const errors: string[] = [];

  // ===================================================================
  // 1. Baner
  // ===================================================================
  const osloGk = await prisma.courseDefinition.findFirst({ where: { name: "Oslo GK" } });
  const gfgk = await prisma.courseDefinition.findFirst({ where: { name: "Gamle Fredrikstad GK" } });
  const borregaard =
    (await prisma.courseDefinition.findFirst({ where: { name: "Borregaard Golfklubb" } })) ??
    (await prisma.courseDefinition.create({ data: { name: "Borregaard Golfklubb", par: 72, rating: 72.8, slope: 128 } }));
  const miklagard =
    (await prisma.courseDefinition.findFirst({ where: { name: "Miklagard Golfklubb" } })) ??
    (await prisma.courseDefinition.create({ data: { name: "Miklagard Golfklubb", par: 72, rating: 73.4, slope: 131 } }));
  if (!osloGk || !gfgk) throw new Error("Fant ikke Oslo GK / Gamle Fredrikstad GK — kjør seed-screentest.ts / seed-baner.ts først.");
  const courses = [osloGk, gfgk, borregaard, miklagard];
  console.log(`Baner: ${courses.map((c) => c.name).join(" · ")}\n`);

  // ===================================================================
  // 2. Runder (14, siste 10 uker) + HoleScore per hull
  // ===================================================================
  await prisma.round.deleteMany({ where: { userId: oyvind.id } });

  const roundOffsets = [68, 63, 58, 52, 47, 42, 37, 32, 27, 21, 16, 11, 6, 2];
  let roundCount = 0;
  let holeScoreCount = 0;
  for (let i = 0; i < roundOffsets.length; i++) {
    const trend = i / (roundOffsets.length - 1);
    const course = courses[i % courses.length];
    const score = Math.round(Math.min(79, Math.max(70, 78 - trend * 7 + rand(-1.5, 1.5))));
    const sgTotal = roundTo(-1.3 + trend * 2.6 + rand(-0.5, 0.5), 2);
    const round = await prisma.round.create({
      data: {
        userId: oyvind.id,
        courseId: course.id,
        playedAt: daysAgo(roundOffsets[i], Math.round(rand(8, 16))),
        score,
        sgTotal,
        ...sgSplit(sgTotal),
        notes: i === roundOffsets.length - 1 ? "Sterk avslutning — jevnt tee-til-green" : null,
      },
    });
    roundCount++;

    const diffs = distributeHoleDiffs(score - 72);
    const holeScores: Prisma.HoleScoreCreateManyInput[] = PAR18.map((par, h) => {
      const strokes = Math.max(1, par + diffs[h]);
      const diff = strokes - par;
      const putts = diff <= -1 ? 1 : Math.random() < 0.15 ? 1 : Math.random() < 0.9 ? 2 : 3;
      const fairway = par !== 3 ? Math.random() < 0.62 : null;
      const gir = strokes - putts <= par - 2;
      return { roundId: round.id, holeNumber: h + 1, par, strokes, putts, fairway, gir };
    });
    await prisma.holeScore.createMany({ data: holeScores });
    holeScoreCount += holeScores.length;
  }
  counts["Round"] = roundCount;
  counts["HoleScore"] = holeScoreCount;
  console.log(`Runder: ${roundCount} · HoleScore: ${holeScoreCount}`);

  // ===================================================================
  // 3. TrackMan-økter (5, siste 30 dager) + shots per kølle
  // ===================================================================
  await prisma.trackManSession.deleteMany({ where: { userId: oyvind.id } });

  type ClubProfile = {
    club: string;
    carry: number;
    total: number;
    ballSpeed: number;
    clubSpeed: number;
    smash: number;
    launch: number;
    spin: number;
  };
  const CLUB_PROFILES: ClubProfile[] = [
    { club: "Driver", carry: 240, total: 248, ballSpeed: 158, clubSpeed: 107, smash: 1.47, launch: 12.5, spin: 2400 },
    { club: "3-tre", carry: 210, total: 217, ballSpeed: 148, clubSpeed: 103, smash: 1.44, launch: 11.5, spin: 3600 },
    { club: "5-jern", carry: 178, total: 183, ballSpeed: 128, clubSpeed: 93, smash: 1.38, launch: 14, spin: 5200 },
    { club: "7-jern", carry: 155, total: 159, ballSpeed: 118, clubSpeed: 89, smash: 1.33, launch: 17, spin: 6600 },
    { club: "9-jern", carry: 133, total: 136, ballSpeed: 105, clubSpeed: 82, smash: 1.28, launch: 22, spin: 8200 },
    { club: "PW", carry: 113, total: 115, ballSpeed: 96, clubSpeed: 77, smash: 1.24, launch: 26, spin: 9200 },
    { club: "56°", carry: 85, total: 86, ballSpeed: 80, clubSpeed: 68, smash: 1.18, launch: 30, spin: 9800 },
  ];

  const tmOffsets = [26, 20, 14, 8, 2];
  let tmSessionCount = 0;
  let tmShotCount = 0;
  for (let i = 0; i < tmOffsets.length; i++) {
    const environment = i % 2 === 0 ? "SIMULATOR_INDOOR" : "RANGE_OUTDOOR_GRASS";
    const shotsPerClub = Math.round(rand(4, 7));
    const session = await prisma.trackManSession.create({
      data: {
        userId: oyvind.id,
        recordedAt: daysAgo(tmOffsets[i], Math.round(rand(9, 17))),
        source: "csv-import",
        shotCount: CLUB_PROFILES.length * shotsPerClub,
        environment: environment as "SIMULATOR_INDOOR" | "RANGE_OUTDOOR_GRASS",
      },
    });
    tmSessionCount++;

    const shots: Prisma.TrackManShotCreateManyInput[] = [];
    let shotNumber = 1;
    for (const p of CLUB_PROFILES) {
      for (let s = 0; s < shotsPerClub; s++) {
        shots.push({
          sessionId: session.id,
          shotNumber: shotNumber++,
          club: p.club,
          ballSpeed: roundTo(p.ballSpeed + rand(-3, 3), 1),
          smashFactor: roundTo(p.smash + rand(-0.02, 0.02), 3),
          launchAngle: roundTo(p.launch + rand(-1.5, 1.5), 1),
          spinRate: Math.round(p.spin + rand(-400, 400)),
          spinAxis: roundTo(rand(-3, 3), 1),
          carryDistance: roundTo(p.carry + rand(-6, 6), 1),
          totalDistance: roundTo(p.total + rand(-6, 6), 1),
          apexHeight: roundTo(p.carry * 0.12 + rand(-1, 1), 1),
          landAngle: roundTo(38 + rand(-4, 4), 1),
          side: roundTo(rand(-6, 6), 1),
          clubSpeed: roundTo(p.clubSpeed + rand(-2, 2), 1),
          attackAngle: roundTo(p.club === "Driver" ? rand(0, 4) : rand(-5, -1), 1),
          clubPath: roundTo(rand(-2.5, 2.5), 1),
          faceAngle: roundTo(rand(-2, 2), 1),
          faceToPath: roundTo(rand(-1.5, 1.5), 1),
          dynamicLoft: roundTo(p.launch * 0.85 + rand(-1, 1), 1),
          recordedAt: session.recordedAt,
        });
      }
    }
    await prisma.trackManShot.createMany({ data: shots });
    tmShotCount += shots.length;
  }
  counts["TrackManSession"] = tmSessionCount;
  counts["TrackManShot"] = tmShotCount;
  console.log(`TrackMan: ${tmSessionCount} økter · ${tmShotCount} shots`);

  // ===================================================================
  // 4. Tester: TestResult (progresjon) + TestAssignment (åpne)
  // ===================================================================
  await prisma.testResult.deleteMany({ where: { userId: oyvind.id } });
  await prisma.testAssignment.deleteMany({ where: { playerId: oyvind.id } });

  const progressionTests: Array<{ name: string; scores: number[]; offsets: number[] }> = [
    { name: "Clubhead Speed (CHS)", scores: [98, 102, 105], offsets: [54, 28, 4] },
    { name: "TN Slagtest", scores: [62, 68, 74], offsets: [50, 24, 6] },
    { name: "Putt 1-3m", scores: [70, 81], offsets: [35, 8] },
  ];
  let testResultCount = 0;
  for (const t of progressionTests) {
    const def = await prisma.testDefinition.findFirst({ where: { name: t.name } });
    if (!def) {
      errors.push(`TestDefinition «${t.name}» finnes ikke — hoppet over.`);
      continue;
    }
    await prisma.testResult.createMany({
      data: t.scores.map((score, i) => ({
        userId: oyvind.id,
        testId: def.id,
        takenAt: daysAgo(t.offsets[i], 16),
        score,
      })),
    });
    testResultCount += t.scores.length;
  }
  counts["TestResult"] = testResultCount;

  const assignmentTests = [
    { name: "TN Wedge Gate", note: "Fokus på avstandskontroll 40-80m", dueInDays: 7 },
    { name: "Ball Throw", note: "Rotasjonstest — sammenlign mot forrige måling", dueInDays: 14 },
    { name: "Standing Long Jump", note: "Årlig fysisk baseline", dueInDays: 21 },
  ];
  let testAssignmentCount = 0;
  for (const a of assignmentTests) {
    const def = await prisma.testDefinition.findFirst({ where: { name: a.name } });
    if (!def) {
      errors.push(`TestDefinition «${a.name}» finnes ikke — hoppet over TestAssignment.`);
      continue;
    }
    await prisma.testAssignment.create({
      data: {
        playerId: oyvind.id,
        coachId: anders.id,
        testId: def.id,
        note: a.note,
        dueDate: addDays(NOW, a.dueInDays, 12),
        status: "OPEN",
      },
    });
    testAssignmentCount++;
  }
  counts["TestAssignment"] = testAssignmentCount;
  console.log(`Tester: ${testResultCount} TestResult · ${testAssignmentCount} TestAssignment (OPEN)`);

  // ===================================================================
  // 5. Fysisk: FysiskPlan → FysUke → FysOkt → FysOvelseRad
  // ===================================================================
  await prisma.fysiskPlan.deleteMany({ where: { userId: oyvind.id } });

  const fysPlan = await prisma.fysiskPlan.create({
    data: {
      userId: oyvind.id,
      opprettetAvId: anders.id,
      navn: "Fysisk periodisering — sommer 2026",
      status: "ACTIVE",
      startDato: daysAgo(21, 8),
      notater: "Fokus styrke + rotasjonshastighet frem mot turneringssesong.",
    },
  });

  type OktSpec = { navn: string; dag: "MAN" | "TIR" | "ONS" | "TOR" | "FRE" | "LOR" | "SON"; type: string; estimertMinutter: number; done: boolean };
  const weekPlan: OktSpec[][] = [
    [
      { navn: "Styrke — underkropp", dag: "MAN", type: "styrke", estimertMinutter: 55, done: true },
      { navn: "Rotasjonskraft", dag: "ONS", type: "rotasjon", estimertMinutter: 40, done: true },
      { navn: "Intervall 400m", dag: "FRE", type: "kondisjon", estimertMinutter: 35, done: true },
    ],
    [
      { navn: "Styrke — helkropp", dag: "MAN", type: "styrke", estimertMinutter: 55, done: true },
      { navn: "Mobilitet hofte/skulder", dag: "TOR", type: "mobilitet", estimertMinutter: 30, done: true },
    ],
    [
      { navn: "Styrke — overkropp", dag: "MAN", type: "styrke", estimertMinutter: 50, done: false },
      { navn: "Rotasjonskraft", dag: "ONS", type: "rotasjon", estimertMinutter: 40, done: false },
      { navn: "Mobilitet", dag: "FRE", type: "mobilitet", estimertMinutter: 25, done: false },
    ],
    [
      { navn: "Styrke — underkropp", dag: "MAN", type: "styrke", estimertMinutter: 55, done: false },
      { navn: "Intervall 400m", dag: "TOR", type: "kondisjon", estimertMinutter: 35, done: false },
    ],
  ];

  let fysUkeCount = 0;
  let fysOktCount = 0;
  let fysRadCount = 0;
  for (let w = 0; w < weekPlan.length; w++) {
    const uke = await prisma.fysUke.create({
      data: { planId: fysPlan.id, ukeNr: w + 1, label: `Uke ${w + 1}`, sortOrder: w },
    });
    fysUkeCount++;
    for (let o = 0; o < weekPlan[w].length; o++) {
      const spec = weekPlan[w][o];
      const okt = await prisma.fysOkt.create({
        data: { ukeId: uke.id, navn: spec.navn, dag: spec.dag, sortOrder: o, estimertMinutter: spec.estimertMinutter, type: spec.type },
      });
      fysOktCount++;

      let rader: Prisma.FysOvelseRadCreateManyInput[] = [];
      if (spec.type === "styrke") {
        const ovelser = [
          { navn: "Knebøy", muskelgruppe: "Ben", repsMin: 6, repsMax: 8 },
          { navn: "Markløft rumensk", muskelgruppe: "Bakkjede", repsMin: 6, repsMax: 8 },
          { navn: "Benkpress", muskelgruppe: "Bryst", repsMin: 8, repsMax: 10 },
          { navn: "Roing sittende", muskelgruppe: "Rygg", repsMin: 8, repsMax: 10 },
          { navn: "Planke", muskelgruppe: "Kjerne", repsMin: 30, repsMax: 45 },
        ];
        rader = ovelser.map((ov, i) => ({
          oktId: okt.id,
          navn: ov.navn,
          sortOrder: i,
          sett: 3,
          repsMin: ov.repsMin,
          repsMax: ov.repsMax,
          muskelgruppe: ov.muskelgruppe,
          loggSettData: spec.done
            ? [
                { vekt: Math.round(rand(40, 90)), reps: ov.repsMax },
                { vekt: Math.round(rand(40, 90)), reps: ov.repsMax - 1 },
                { vekt: Math.round(rand(40, 90)), reps: ov.repsMin },
              ]
            : undefined,
        }));
      } else if (spec.type === "rotasjon") {
        rader = [
          { navn: "Cable rotasjon stående", muskelgruppe: "Kjerne", repsMin: 10, repsMax: 12 },
          { navn: "Medisinball kast — sidearm", muskelgruppe: "Kjerne", repsMin: 8, repsMax: 10 },
          { navn: "Landmine rotasjon", muskelgruppe: "Kjerne", repsMin: 10, repsMax: 12 },
          { navn: "Golfsving mot motstand", muskelgruppe: "Kjerne", repsMin: 10, repsMax: 10 },
        ].map((ov, i) => ({
          oktId: okt.id,
          navn: ov.navn,
          sortOrder: i,
          sett: 3,
          repsMin: ov.repsMin,
          repsMax: ov.repsMax,
          muskelgruppe: ov.muskelgruppe,
        }));
      } else if (spec.type === "mobilitet") {
        rader = [
          { navn: "Hofteåpner — 90/90", repsMin: 8, repsMax: 8 },
          { navn: "Skulderrotasjon m/ stav", repsMin: 10, repsMax: 10 },
          { navn: "Thoracal rotasjon", repsMin: 8, repsMax: 8 },
          { navn: "Hamstrings-tøy", repsMin: 30, repsMax: 30 },
        ].map((ov, i) => ({ oktId: okt.id, navn: ov.navn, sortOrder: i, sett: 2, repsMin: ov.repsMin, repsMax: ov.repsMax }));
      } else {
        // kondisjon
        rader = [
          {
            oktId: okt.id,
            navn: "Intervall 400m",
            sortOrder: 0,
            sett: 6,
            intervallSerier: 6,
            intervallMinutter: 2,
            pulssone: "S4",
          },
          {
            oktId: okt.id,
            navn: "Nedjogg",
            sortOrder: 1,
            sett: 1,
            intervallSerier: 1,
            intervallMinutter: 10,
            pulssone: "S2",
          },
        ];
      }
      await prisma.fysOvelseRad.createMany({ data: rader });
      fysRadCount += rader.length;
    }
  }
  counts["FysiskPlan"] = 1;
  counts["FysUke"] = fysUkeCount;
  counts["FysOkt"] = fysOktCount;
  counts["FysOvelseRad"] = fysRadCount;
  console.log(`Fysisk: 1 plan · ${fysUkeCount} uker · ${fysOktCount} økter · ${fysRadCount} øvelsesrader`);

  // ===================================================================
  // 6. Utviklingsplan: TalentTracking + TechnicalPlan → Positions → Tasks → TmGoals + PlanSuggestion
  // ===================================================================
  await prisma.talentTracking.upsert({
    where: { userId: oyvind.id },
    update: {
      niva: "U16",
      klubb: "Oslo Golfklubb",
      region: "Oslo",
      fysisk: 7,
      teknikk: 8,
      taktikk: 6,
      mental: 7,
      motivasjon: 8,
      milepaeler: [
        { tittel: "Under HCP 5", dato: daysAgo(40).toISOString(), beskrivelse: "Nådd via jevn SG-fremgang vår 2026" },
        { tittel: "Kvalifisert Srixon Tour", dato: daysAgo(15).toISOString(), beskrivelse: "Kvalik-runde 71 på Oslo GK" },
        { tittel: "HCP 2,0", dato: addDays(NOW, 80).toISOString(), beskrivelse: "Sesongmål — pågår" },
      ],
    },
    create: {
      userId: oyvind.id,
      niva: "U16",
      klubb: "Oslo Golfklubb",
      region: "Oslo",
      fysisk: 7,
      teknikk: 8,
      taktikk: 6,
      mental: 7,
      motivasjon: 8,
      milepaeler: [
        { tittel: "Under HCP 5", dato: daysAgo(40).toISOString(), beskrivelse: "Nådd via jevn SG-fremgang vår 2026" },
        { tittel: "Kvalifisert Srixon Tour", dato: daysAgo(15).toISOString(), beskrivelse: "Kvalik-runde 71 på Oslo GK" },
        { tittel: "HCP 2,0", dato: addDays(NOW, 80).toISOString(), beskrivelse: "Sesongmål — pågår" },
      ],
    },
  });
  counts["TalentTracking"] = 1;

  await prisma.technicalPlan.deleteMany({ where: { userId: oyvind.id } });
  const techPlan = await prisma.technicalPlan.create({
    data: {
      userId: oyvind.id,
      opprettetAvId: anders.id,
      navn: "Teknisk utviklingsplan — sommer 2026",
      status: "ACTIVE",
      startDato: daysAgo(28, 9),
    },
  });

  const positionSpecs = [
    { pNummer: "P2.0", navn: "Takeaway", hovedfokus: false },
    { pNummer: "P4.0", navn: "Topp-svingen", hovedfokus: true },
    { pNummer: "P6.0", navn: "Nedsving — parallell", hovedfokus: false },
  ];
  let positionCount = 0;
  let taskCount = 0;
  let tmGoalCount = 0;
  for (let p = 0; p < positionSpecs.length; p++) {
    const spec = positionSpecs[p];
    const position = await prisma.technicalPlanPosition.create({
      data: { planId: techPlan.id, pNummer: spec.pNummer, navn: spec.navn, sortOrder: p, hovedfokus: spec.hovedfokus },
    });
    positionCount++;

    const taskDefs = spec.hovedfokus
      ? [
          { tittel: "Stabil topp-posisjon — venstre håndledd flatt", status: "ACTIVE" as const, trackStatus: "PAA_VEI" as const, cs: "CS70" as const, lFase: "L_KOLLE" as const },
          { tittel: "Redusere overrotasjon skulder", status: "PENDING" as const, trackStatus: "INAKTIV" as const, cs: "CS60" as const, lFase: "L_KROPP" as const },
        ]
      : [
          { tittel: `Sekvens ${spec.navn.toLowerCase()}`, status: "DONE" as const, trackStatus: "FERDIG" as const, cs: "CS90" as const, lFase: "L_AUTO" as const },
          { tittel: `Konsistens ${spec.navn.toLowerCase()}`, status: "PENDING" as const, trackStatus: "PAA_VEI" as const, cs: "CS60" as const, lFase: "L_ARM" as const },
        ];

    for (let t = 0; t < taskDefs.length; t++) {
      const td = taskDefs[t];
      const task = await prisma.positionTask.create({
        data: {
          positionId: position.id,
          sortOrder: t,
          tittel: td.tittel,
          pyramide: "TEK",
          omraade: "Tee Total",
          koller: ["7-jern", "Driver"],
          lFase: td.lFase,
          cs: td.cs,
          miljo: "M3",
          prPress: "PR2",
          repsMaalDry: 40,
          repsMaalLav: 60,
          repsMaalFull: 80,
          repsGjortDry: td.status === "PENDING" ? 5 : 40,
          repsGjortLav: td.status === "PENDING" ? 0 : 55,
          repsGjortFull: td.status === "DONE" ? 80 : td.status === "ACTIVE" ? 38 : 0,
          status: td.status,
          trackStatus: td.trackStatus,
          lastRepLoggedAt: td.status === "PENDING" ? null : daysAgo(3, 17),
        },
      });
      taskCount++;

      if (td.status === "ACTIVE" || td.status === "DONE") {
        await prisma.positionTaskTmGoal.create({
          data: {
            taskId: task.id,
            metric: "dispersion_m_std",
            klubb: "7-jern",
            baselineValue: 6.8,
            baselineFrom: "auto-30d",
            baselineDate: daysAgo(28),
            baselineN: 42,
            targetValue: 4.5,
            targetType: "PRIMARY",
            comparison: "LESS_THAN",
            currentValue: td.status === "DONE" ? 4.3 : 5.6,
            progressPct: td.status === "DONE" ? 100 : 55,
            inTarget: td.status === "DONE",
            lastUpdated: daysAgo(3),
          },
        });
        tmGoalCount++;
      }
    }
  }
  counts["TechnicalPlan"] = 1;
  counts["TechnicalPlanPosition"] = positionCount;
  counts["PositionTask"] = taskCount;
  counts["PositionTaskTmGoal"] = tmGoalCount;

  const suggestionSpecs: Array<{ type: Prisma.PlanSuggestionCreateManyInput["type"]; reason: string; payload: Prisma.InputJsonValue; evidence: Prisma.InputJsonValue }> = [
    {
      type: "RE_PRIORITIZE",
      reason: "Dispersion på 7-jern har stagnert 14 dager — foreslår å prioritere denne foran nedsving-arbeidet.",
      payload: { taskTittel: "Stabil topp-posisjon — venstre håndledd flatt", nySortOrder: 0 },
      evidence: { metric: "dispersion_m_std", trend: "flat", days: 14 },
    },
    {
      type: "NEW_TASK",
      reason: "TrackMan viser konsistent åpent klubbblad ved impact siste 3 økter.",
      payload: { tittel: "Face control — impact", pyramide: "TEK", omraade: "Tee Total" },
      evidence: { metric: "face_angle_avg", value: 2.4, sessions: 3 },
    },
    {
      type: "ADJUST_GOAL",
      reason: "Baseline-dispersion har forbedret seg — mål bør strammes inn.",
      payload: { metric: "dispersion_m_std", nyTarget: 4.0 },
      evidence: { metric: "dispersion_m_std", from: 6.8, to: 5.6 },
    },
  ];
  await prisma.planSuggestion.createMany({
    data: suggestionSpecs.map((s) => ({
      planId: techPlan.id,
      type: s.type,
      payload: s.payload,
      evidence: s.evidence,
      reason: s.reason,
      status: "PENDING",
    })),
  });
  counts["PlanSuggestion"] = suggestionSpecs.length;
  console.log(`Utviklingsplan: ${positionCount} posisjoner · ${taskCount} tasks · ${tmGoalCount} TM-mål · ${suggestionSpecs.length} forslag`);

  // ===================================================================
  // 7. Mål (Goal)
  // ===================================================================
  await prisma.goal.deleteMany({ where: { userId: oyvind.id } });
  await prisma.goal.createMany({
    data: [
      {
        userId: oyvind.id,
        type: "HCP_TARGET",
        category: "OUTCOME",
        title: "Hcp 2,0 innen sesongslutt",
        targetValue: 2.0,
        targetDate: new Date(NOW.getFullYear(), 9, 15),
        status: "ACTIVE",
      },
      {
        userId: oyvind.id,
        type: "SG_AREA",
        category: "PROCESS",
        title: "Positiv SG Nærspill hver runde",
        targetValue: 0,
        status: "ACTIVE",
      },
      {
        userId: oyvind.id,
        type: "ROUNDS_PER_MONTH",
        category: "PROCESS",
        title: "Minst 8 registrerte runder per måned",
        targetValue: 8,
        status: "ACTIVE",
      },
    ],
  });
  counts["Goal"] = 3;

  // ===================================================================
  // 8. Achievement (upsert nye kinds — rører ikke eksisterende)
  // ===================================================================
  await prisma.achievement.upsert({
    where: { userId_kind: { userId: oyvind.id, kind: "STREAK_7" } },
    update: {},
    create: { userId: oyvind.id, kind: "STREAK_7", earnedAt: daysAgo(9), payload: { days: 7 } },
  });
  await prisma.achievement.upsert({
    where: { userId_kind: { userId: oyvind.id, kind: "STREAK_14" } },
    update: {},
    create: { userId: oyvind.id, kind: "STREAK_14", earnedAt: daysAgo(2), payload: { days: 14 } },
  });
  counts["Achievement"] = 2;
  console.log(`Mål: 3 · Achievement (nye): 2`);

  // ===================================================================
  // 9. Utfordringer (DrillChallenge + ChallengeParticipant)
  // ===================================================================
  await prisma.drillChallenge.deleteMany({ where: { ownerId: oyvind.id } });
  const activeChallenge = await prisma.drillChallenge.create({
    data: {
      ownerId: oyvind.id,
      name: "Putt-streak 3 meter",
      description: "30 forsøk, mål 24/30 innen fredag.",
      startAt: daysAgo(10),
      endAt: addDays(NOW, 5),
      status: "ACTIVE",
    },
  });
  await prisma.challengeParticipant.create({
    data: { challengeId: activeChallenge.id, userId: oyvind.id, score: 21, rank: 1 },
  });
  const endedChallenge = await prisma.drillChallenge.create({
    data: {
      ownerId: oyvind.id,
      name: "Wedge-presisjon 50-80m",
      description: "Snitt-avstand til pin over 20 slag.",
      startAt: daysAgo(30),
      endAt: daysAgo(5),
      status: "ENDED",
    },
  });
  await prisma.challengeParticipant.create({
    data: { challengeId: endedChallenge.id, userId: oyvind.id, score: 4.2, rank: 1 },
  });
  counts["DrillChallenge"] = 2;
  counts["ChallengeParticipant"] = 2;
  console.log(`Utfordringer: 2 (1 aktiv, 1 fullført)`);

  // ===================================================================
  // 10. Coach-dialog (CoachingSession, kind DIRECT)
  // ===================================================================
  await prisma.coachingSession.deleteMany({ where: { userId: oyvind.id, coachId: anders.id, kind: "DIRECT" } });
  const dialogMessages = [
    { role: "user", content: "Hei Anders! Testet 56-graderen på simulatoren i går — spinnet er mye høyere enn før.", ts: daysAgo(2, 18, 10).toISOString() },
    { role: "coach", content: "Bra observasjon. Sjekket TrackMan-loggen din nå — spin er opp fra ~9000 til 9800 rpm. Sannsynlig strike lenger ned på bladet.", ts: daysAgo(2, 19, 2).toISOString() },
    { role: "user", content: "Ja, føles som jeg treffer litt tynt fortsatt fra det åpne stancet.", ts: daysAgo(2, 19, 5).toISOString() },
    { role: "coach", content: "La oss ta en drill på impact-posisjon P6 på neste økt. Jeg legger inn en task i utviklingsplanen din nå.", ts: daysAgo(1, 8, 30).toISOString() },
    { role: "coach", content: "Forresten — bra sluttrunde på Oslo GK. SG putt var solid, +0.6.", ts: daysAgo(1, 8, 32).toISOString() },
    { role: "user", content: "Takk! Putteren føles mye bedre nå med den nye rutinen.", ts: daysAgo(1, 12, 0).toISOString() },
    { role: "coach", content: "Bra økt i dag — se klippet jeg la i Videoer.", ts: daysAgo(0, 9, 15).toISOString() },
    { role: "user", content: "Så det, skal se på det i kveld. Er klar for Srixon Tour om to uker.", ts: daysAgo(0, 14, 40).toISOString() },
  ];
  await prisma.coachingSession.create({
    data: {
      userId: oyvind.id,
      coachId: anders.id,
      kind: "DIRECT",
      messages: dialogMessages,
      updatedAt: new Date(dialogMessages[dialogMessages.length - 1].ts),
    },
  });
  counts["CoachingSession"] = 1;
  console.log(`Coach-dialog: 1 tråd · ${dialogMessages.length} meldinger`);

  // ===================================================================
  // 11. Booking (Flex 20 m/ Anders)
  // ===================================================================
  const flexServiceType = await prisma.serviceType.upsert({
    where: { slug: "screentest-flex-20-anders" },
    update: { name: "Flex 20 min — Anders", priceOre: 45000, durationMin: 20, coachUserId: anders.id, active: false, description: "Demo-tjeneste (screentest)" },
    create: {
      slug: "screentest-flex-20-anders",
      name: "Flex 20 min — Anders",
      priceOre: 45000,
      durationMin: 20,
      coachUserId: anders.id,
      active: false,
      description: "Demo-tjeneste (screentest)",
    },
  });
  const mulligan = await prisma.location.findFirst({ where: { name: "Mulligan Indoor Golf" } });
  if (!mulligan) throw new Error("Fant ikke Location «Mulligan Indoor Golf».");

  await prisma.booking.deleteMany({ where: { userId: oyvind.id } });
  await prisma.booking.createMany({
    data: [
      {
        userId: oyvind.id,
        coachId: anders.id,
        serviceTypeId: flexServiceType.id,
        locationId: mulligan.id,
        startAt: addDays(NOW, 4, 15, 0),
        endAt: addDays(NOW, 4, 15, 20),
        status: "CONFIRMED",
        priceOre: flexServiceType.priceOre,
      },
      {
        userId: oyvind.id,
        coachId: anders.id,
        serviceTypeId: flexServiceType.id,
        locationId: mulligan.id,
        startAt: addDays(NOW, 8, 16, 30),
        endAt: addDays(NOW, 8, 16, 50),
        status: "CONFIRMED",
        priceOre: flexServiceType.priceOre,
      },
      {
        userId: oyvind.id,
        coachId: anders.id,
        serviceTypeId: flexServiceType.id,
        locationId: mulligan.id,
        startAt: daysAgo(10, 15, 0),
        endAt: daysAgo(10, 15, 20) as Date,
        status: "COMPLETED",
        priceOre: flexServiceType.priceOre,
      },
      {
        userId: oyvind.id,
        coachId: anders.id,
        serviceTypeId: flexServiceType.id,
        locationId: mulligan.id,
        startAt: daysAgo(24, 14, 0),
        endAt: daysAgo(24, 14, 20) as Date,
        status: "COMPLETED",
        priceOre: flexServiceType.priceOre,
      },
    ],
  });
  counts["Booking"] = 4;
  console.log(`Booking: 4 (2 kommende Flex 20 m/ Anders · 2 gjennomførte)`);

  // ===================================================================
  // 12. Workbench: TrainingPlan (denne + neste uke) + TrainingPlanSession
  // ===================================================================
  await prisma.trainingPlan.deleteMany({ where: { userId: oyvind.id } });
  const weekStart = startOfIsoWeek(NOW);
  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      userId: oyvind.id,
      name: "Sommerblokk juli 2026",
      startDate: weekStart,
      endDate: addDays(weekStart, 20),
      isActive: true,
      status: "ACTIVE",
      createdById: anders.id,
    },
  });

  type PlanSessionSpec = {
    dayOffset: number;
    h: number;
    title: string;
    pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
    skillArea: "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL";
    environment: "RANGE" | "BANE" | "STUDIO" | "SIMULATOR";
    lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
    pressureLevel: "PR2" | "PR3" | "PR4";
    dur: number;
  };
  const planSessionSpecs: PlanSessionSpec[] = [
    { dayOffset: 0, h: 17, title: "Teknisk blokk · P5–P6", pyramidArea: "TEK", skillArea: "TEE_TOTAL", environment: "RANGE", lPhase: "SPESIAL", pressureLevel: "PR2", dur: 90 },
    { dayOffset: 2, h: 17, title: "Wedge-avstander 50-80 m", pyramidArea: "SLAG", skillArea: "TILNAERMING", environment: "RANGE", lPhase: "SPESIAL", pressureLevel: "PR3", dur: 60 },
    { dayOffset: 4, h: 10, title: "9 hull på banen", pyramidArea: "SPILL", skillArea: "SPILL", environment: "BANE", lPhase: "GRUNN", pressureLevel: "PR2", dur: 120 },
    { dayOffset: 7, h: 17, title: "Styrke + mobilitet", pyramidArea: "FYS", skillArea: "TEE_TOTAL", environment: "STUDIO", lPhase: "GRUNN", pressureLevel: "PR2", dur: 60 },
    { dayOffset: 9, h: 17, title: "Backsving-sekvens P2–P4", pyramidArea: "TEK", skillArea: "TEE_TOTAL", environment: "SIMULATOR", lPhase: "SPESIAL", pressureLevel: "PR2", dur: 75 },
    { dayOffset: 11, h: 9, title: "Klubbmesterskap — kvalifisering", pyramidArea: "TURN", skillArea: "SPILL", environment: "BANE", lPhase: "TURNERING", pressureLevel: "PR4", dur: 240 },
  ];
  const planSessionRows: Prisma.TrainingPlanSessionCreateManyInput[] = planSessionSpecs.map((s) => {
    const scheduledAt = addDays(weekStart, s.dayOffset, s.h);
    return {
      planId: trainingPlan.id,
      scheduledAt,
      durationMin: s.dur,
      title: s.title,
      pyramidArea: s.pyramidArea,
      skillArea: s.skillArea,
      environment: s.environment,
      lPhase: s.lPhase,
      pressureLevel: s.pressureLevel,
      status: scheduledAt < NOW ? "COMPLETED" : "PLANNED",
    };
  });
  await prisma.trainingPlanSession.createMany({ data: planSessionRows });
  counts["TrainingPlan"] = 1;
  counts["TrainingPlanSession"] = planSessionRows.length;
  console.log(`Workbench: 1 TrainingPlan · ${planSessionRows.length} TrainingPlanSession (denne + neste uke)`);

  // ---- PlanSession (ukentlig planner-rutenett: week/day/axis) ----
  await prisma.planSession.deleteMany({ where: { userId: oyvind.id } });
  const curWeek = isoWeekNumber(NOW);
  const nextWeek = isoWeekNumber(addDays(NOW, 7));
  const todayIdx = isoDayIndex(NOW);
  const planSessionGridSpecs: Array<{ week: number; day: number; axis: string; title: string; meta: string; done: boolean; isNow: boolean; isPeak: boolean }> = [
    { week: curWeek, day: 0, axis: "tek", title: "Teknisk blokk — P5/P6", meta: "90 min · range", done: todayIdx > 0, isNow: todayIdx === 0, isPeak: false },
    { week: curWeek, day: 2, axis: "slag", title: "Wedge-avstander 50-80 m", meta: "60 min · range", done: todayIdx > 2, isNow: todayIdx === 2, isPeak: false },
    { week: curWeek, day: 4, axis: "spill", title: "9 hull på banen", meta: "120 min · bane", done: todayIdx > 4, isNow: todayIdx === 4, isPeak: false },
    { week: nextWeek, day: 0, axis: "fys", title: "Styrke + mobilitet", meta: "60 min · studio", done: false, isNow: false, isPeak: false },
    { week: nextWeek, day: 2, axis: "tek", title: "Backsving-sekvens P2-P4", meta: "75 min · simulator", done: false, isNow: false, isPeak: false },
    { week: nextWeek, day: 4, axis: "turn", title: "Klubbmesterskap — kvalifisering", meta: "Turnering · Oslo GK", done: false, isNow: false, isPeak: true },
  ];
  await prisma.planSession.createMany({
    data: planSessionGridSpecs.map((s) => ({
      userId: oyvind.id,
      week: s.week,
      day: s.day,
      axis: s.axis,
      title: s.title,
      meta: s.meta,
      done: s.done,
      isNow: s.isNow,
      isPeak: s.isPeak,
    })),
  });
  counts["PlanSession"] = planSessionGridSpecs.length;
  console.log(`Workbench: ${planSessionGridSpecs.length} PlanSession (uke ${curWeek} + ${nextWeek})`);

  // ===================================================================
  // 13. TrainingSessionV2: dagens + morgendagens økt m/ 3-4 drills
  // ===================================================================
  const todayStart = new Date(NOW);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = addDays(todayStart, 1);
  const todaySession = await prisma.trainingSessionV2.findFirst({
    where: { studentId: oyvind.id, startTime: { gte: todayStart, lt: todayEnd } },
    include: { drills: true },
  });
  let toppedUpDrills = 0;
  if (todaySession && todaySession.drills.length < 3) {
    const extra: Array<{ name: string; durationMinutes: number; pyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" }> = [
      { name: "3 m putt-rutine", durationMinutes: 15, pyramide: "TEK" },
      { name: "Lag-putt 6-9 m", durationMinutes: 15, pyramide: "SPILL" },
    ];
    let sortOrder = todaySession.drills.length;
    for (const d of extra) {
      await prisma.trainingDrillV2.create({
        data: { sessionId: todaySession.id, sortOrder: sortOrder++, name: d.name, durationMinutes: d.durationMinutes, pyramide: d.pyramide },
      });
      toppedUpDrills++;
    }
  }

  const tomorrowStart = addDays(todayStart, 1);
  const tomorrowSession = await prisma.trainingSessionV2.findFirst({
    where: { studentId: oyvind.id, startTime: { gte: tomorrowStart, lt: addDays(tomorrowStart, 1) } },
  });
  let createdTomorrow = false;
  if (!tomorrowSession) {
    await prisma.trainingSessionV2.create({
      data: {
        title: "Fullsving-blokk · P4-P6",
        studentId: oyvind.id,
        coachId: anders.id,
        startTime: addDays(todayStart, 1, 9, 0),
        endTime: addDays(todayStart, 1, 10, 30),
        miljo: "M2",
        practiceType: "BLOKK",
        status: "PLANNED",
        isCoachCreated: true,
        drills: {
          create: [
            { sortOrder: 0, name: "Topp-posisjon — speil-drill", durationMinutes: 20, pyramide: "TEK" },
            { sortOrder: 1, name: "Stinger 150 m", durationMinutes: 25, pyramide: "SLAG" },
            { sortOrder: 2, name: "Impact-bag — nedsving", durationMinutes: 15, pyramide: "TEK" },
            { sortOrder: 3, name: "Aktivering — hofte/skulder", durationMinutes: 10, pyramide: "FYS" },
          ],
        },
      },
    });
    createdTomorrow = true;
  }
  console.log(`TrainingSessionV2: toppet opp dagens økt med ${toppedUpDrills} drills · morgendagens økt ${createdTomorrow ? "opprettet" : "fantes allerede"}`);

  // ---- DrillLogV2 på et utvalg fullførte økter (Trening-fane) ----
  await prisma.drillLogV2.deleteMany({ where: { loggedBy: oyvind.id } });
  const completedSessions = await prisma.trainingSessionV2.findMany({
    where: { studentId: oyvind.id, status: "COMPLETED" },
    include: { drills: true },
    orderBy: { startTime: "desc" },
    take: 4,
  });
  let drillLogCount = 0;
  for (const s of completedSessions) {
    for (const drill of s.drills) {
      const repsTotal = Math.round(rand(15, 35));
      await prisma.drillLogV2.create({
        data: {
          drillId: drill.id,
          loggedBy: oyvind.id,
          successRate: Math.round(rand(58, 92)),
          repsTotal,
          repsWithoutBall: Math.round(repsTotal * 0.1),
          repsLowSpeed: Math.round(repsTotal * 0.2),
          repsAutomatic: Math.round(repsTotal * 0.15),
          repsHit: Math.round(repsTotal * 0.55),
          loggedAt: s.startTime,
        },
      });
      drillLogCount++;
    }
  }
  counts["DrillLogV2"] = drillLogCount;
  console.log(`Trening-fane: ${drillLogCount} DrillLogV2 på ${completedSessions.length} fullførte økter`);

  // ===================================================================
  // 14. InnboksEpost (3 globale eksempler)
  // ===================================================================
  const innboksMarkers = ["ny.kunde.demo@eksempel.no", "regnskap.demo@bedrift.no", "trener.demo@wang-toppidrett.no"];
  await prisma.innboksEpost.deleteMany({ where: { fraEpost: { in: innboksMarkers } } });
  await prisma.innboksEpost.createMany({
    data: [
      {
        fraEpost: innboksMarkers[0],
        fraNavn: "Kari Nordmann",
        emne: "Forespørsel om prøvetime",
        brodtekst: "Hei! Sønnen min på 14 år spiller golf og vi lurer på om det er mulig å booke en prøvetime hos en av trenerne deres. Han har HCP 18 og ønsker å jobbe med fullsvingen.",
        mottattAt: daysAgo(2, 9, 20),
        status: "NY",
      },
      {
        fraEpost: innboksMarkers[1],
        fraNavn: "Ole Bergersen",
        emne: "Spørsmål om faktura mai",
        brodtekst: "Hei, jeg fikk en faktura for mai måned som virker å inneholde en økt jeg avbestilte i god tid. Kan dere se på dette?",
        mottattAt: daysAgo(4, 13, 5),
        status: "UTKAST_KLART",
        utkastSvar: "Hei Ole! Takk for at du tar kontakt. Jeg har sjekket bookingen din fra 14. mai — den ble avbestilt innenfor fristen, så vi krediterer beløpet på neste faktura. Beklager rotet!",
        utkastGenerertAt: daysAgo(1, 8, 0),
      },
      {
        fraEpost: innboksMarkers[2],
        fraNavn: "WANG Toppidrett Fredrikstad",
        emne: "Henvendelse ang. treningstider høst",
        brodtekst: "Hei Anders, vi planlegger timeplanen for høsten og lurer på om dere har kapasitet til å utvide golf-linja med én økt til per uke fra august.",
        mottattAt: daysAgo(1, 10, 45),
        status: "NY",
      },
    ],
  });
  counts["InnboksEpost"] = 3;
  console.log(`InnboksEpost: 3 (global innboks)\n`);

  // ===================================================================
  // Oppsummering
  // ===================================================================
  console.log("── Ferdig ──");
  for (const [model, n] of Object.entries(counts)) {
    console.log(`${model}: ${n}`);
  }
  if (errors.length > 0) {
    console.log("\n── Advarsler ──");
    for (const e of errors) console.log(`- ${e}`);
  }

  await prisma.$disconnect();

  return { counts, errors };
}

main()
  .then(({ counts, errors }) => {
    console.log("\nSTRUCTURED_RESULT_START");
    console.log(JSON.stringify({ counts, errors }));
    console.log("STRUCTURED_RESULT_END");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
