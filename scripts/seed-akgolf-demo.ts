/**
 * Seed PlayerHQ-demo-spilleren: akgolfgroup@gmail.com = «Anders S Kristiansen».
 *
 * Lager:
 *  - Supabase Auth-bruker (email_confirm, kjent passord) så Anders kan logge inn og demonstrere.
 *  - Prisma User koblet via authId (PLAYER · PRO).
 *  - Rik demo-data (runder, SG, TrackMan, helse, plan, insights) så skjermene ikke er tomme.
 *  - Setter også markus@akgolf.no til ADMIN (begge roller — ADMIN er supersett av COACH).
 *
 * Idempotent. Kjør: npx tsx scripts/seed-akgolf-demo.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const EMAIL = "akgolfgroup@gmail.com";
const PASSWORD = "AkGolfDemo2026!";
const NAME = "Anders S Kristiansen";

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

/** Opprett (eller hent) Supabase Auth-bruker og returner auth-id. */
async function ensureAuthUser(): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: "PLAYER", tier: "PRO", firstName: "Anders S", lastName: "Kristiansen" },
  });
  if (created.data.user) {
    console.log(`Auth-bruker opprettet: ${created.data.user.id}`);
    return created.data.user.id;
  }
  // Finnes allerede — finn og resett passord.
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email === EMAIL);
  if (!existing) throw new Error(`Kunne ikke opprette eller finne auth-bruker: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: "PLAYER", tier: "PRO", firstName: "Anders S", lastName: "Kristiansen" },
  });
  console.log(`Auth-bruker fantes — passord resatt: ${existing.id}`);
  return existing.id;
}

async function main() {
  console.log("Seeder PlayerHQ-demo (Anders S Kristiansen) + setter Markus til ADMIN...");
  const authId = await ensureAuthUser();

  // 1. Prisma User koblet via authId
  const player = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { authId, name: NAME, role: "PLAYER", tier: "PRO", hcp: 4.2, playingYears: 12, ambition: "NM-topping og lavere HCP", homeClub: "Oslo GK", avatarUrl: null },
    create: { authId, email: EMAIL, name: NAME, role: "PLAYER", tier: "PRO", hcp: 4.2, playingYears: 12, ambition: "NM-topping og lavere HCP", homeClub: "Oslo GK" },
  });
  console.log(`Spiller-User: ${player.id}`);

  let course = await prisma.courseDefinition.findFirst({ where: { name: "Oslo GK" } });
  if (!course) {
    course = await prisma.courseDefinition.create({ data: { name: "Oslo GK", par: 71, rating: 71.4, slope: 124 } });
  }

  // Ren seed
  await prisma.round.deleteMany({ where: { userId: player.id } });
  await prisma.trackManSession.deleteMany({ where: { userId: player.id } });
  await prisma.testResult.deleteMany({ where: { userId: player.id } });
  await prisma.healthEntry.deleteMany({ where: { userId: player.id } });
  await prisma.trainingPlan.deleteMany({ where: { userId: player.id } });
  await prisma.sgInsight.deleteMany({ where: { userId: player.id } });
  await prisma.clubMetricTrend.deleteMany({ where: { userId: player.id } });

  const today = new Date(2026, 5, 8);

  // 2. 14 runder med stigende SG
  const roundsData = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 88 - i * 6 - Math.floor(rand(0, 3));
    const trend = i / 14;
    const sgTotal = roundTo(-1.5 + trend * 3 + rand(-1, 1), 2);
    const sgOtt = roundTo(-0.5 + trend * 0.8 + rand(-0.5, 0.5), 2);
    const sgApp = roundTo(-0.4 + trend * 1.1 + rand(-0.6, 0.6), 2);
    const sgArg = roundTo(-0.3 + trend * 0.6 + rand(-0.4, 0.4), 2);
    const sgPutt = roundTo(-0.3 + trend * 0.5 + rand(-0.5, 0.5), 2);
    return {
      userId: player.id, courseId: course!.id, playedAt: addDays(today, -daysAgo),
      score: Math.round(71 - sgTotal * 1.1 + rand(-1, 1)),
      sgTotal, sgOtt, sgApp, sgArg, sgPutt,
      sgTee: roundTo(sgOtt * 0.85, 2),
      sgApp200: roundTo(sgApp * 0.2 + rand(-0.2, 0.2), 2), sgApp150: roundTo(sgApp * 0.35 + rand(-0.2, 0.2), 2),
      sgApp100: roundTo(sgApp * 0.3 + rand(-0.15, 0.15), 2), sgApp50: roundTo(sgApp * 0.15 + rand(-0.1, 0.1), 2),
      sgChip: roundTo(sgArg * 0.4 + rand(-0.1, 0.1), 2), sgPitch: roundTo(sgArg * 0.35 + rand(-0.1, 0.1), 2),
      sgBunker: roundTo(sgArg * 0.15 + rand(-0.05, 0.05), 2),
      sgPutt0_3: roundTo(sgPutt * 0.45 + rand(-0.1, 0.1), 2), sgPutt3_5: roundTo(sgPutt * 0.3 + rand(-0.1, 0.1), 2),
      sgPutt5_10: roundTo(sgPutt * 0.15 + rand(-0.08, 0.08), 2), sgPutt10_15: roundTo(sgPutt * 0.07 + rand(-0.05, 0.05), 2),
      notes: i === 13 ? "Sterk sluttrunde — 4 birdies på back-9" : null,
    };
  });
  await prisma.round.createMany({ data: roundsData });

  // 3. 12 TrackMan-økter
  await prisma.trackManSession.createMany({
    data: Array.from({ length: 12 }, (_, i) => ({
      userId: player.id, recordedAt: addDays(today, -(58 - i * 5)), source: "csv-import",
      shotCount: Math.round(rand(30, 90)),
      environment: (i % 3 === 0 ? "RANGE_OUTDOOR_GRASS" : "SIMULATOR_INDOOR") as "RANGE_OUTDOOR_GRASS" | "SIMULATOR_INDOOR",
    })),
  });

  // 4. 30 dager helse
  await prisma.healthEntry.createMany({
    data: Array.from({ length: 30 }, (_, i) => ({
      userId: player.id, date: addDays(today, -(29 - i)),
      restingHr: Math.round(rand(52, 60)), sleepHours: roundTo(rand(6.2, 8.4), 1), weightKg: roundTo(78 + rand(-1.5, 1.5), 1),
      notes: i === 5 ? "Litt stiv etter lang økt" : null,
    })),
  });

  // 5. Testresultater hvis definisjoner finnes
  const tests = await prisma.testDefinition.findMany({ take: 6 });
  if (tests.length > 0) {
    await prisma.testResult.createMany({
      data: tests.map((t, i) => ({ userId: player.id, testId: t.id, takenAt: addDays(today, -((i + 1) * 14)), score: roundTo(rand(60, 92), 1), notes: null })),
    });
  }

  // 6. TrainingPlan + 12 sessions
  const plan = await prisma.trainingPlan.create({
    data: { userId: player.id, name: "Vår-progresjon 2026", startDate: addDays(today, -28), endDate: addDays(today, 28), isActive: true, status: "ACTIVE" },
  });
  const pyr: Array<"FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"> = ["TEK", "SLAG", "SPILL", "TEK", "FYS", "SLAG", "SPILL", "TURN", "TEK", "SLAG", "SPILL", "TURN"];
  const skill: Array<"TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL"> = ["TEE_TOTAL", "TILNAERMING", "PUTTING", "AROUND_GREEN", "TEE_TOTAL", "TILNAERMING", "PUTTING", "SPILL", "TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING"];
  const lph: Array<"GRUNN" | "SPESIAL" | "TURNERING"> = ["GRUNN", "GRUNN", "GRUNN", "GRUNN", "SPESIAL", "SPESIAL", "SPESIAL", "SPESIAL", "TURNERING", "TURNERING", "TURNERING", "TURNERING"];
  await prisma.trainingPlanSession.createMany({
    data: Array.from({ length: 12 }, (_, i) => ({
      planId: plan.id, scheduledAt: addDays(today, -24 + i * 4), durationMin: [60, 90, 120][i % 3],
      title: `Økt ${i + 1} — ${skill[i]}`, pyramidArea: pyr[i], skillArea: skill[i],
      environment: (["RANGE", "BANE", "STUDIO", "SIMULATOR"][i % 4]) as "RANGE" | "BANE" | "STUDIO" | "SIMULATOR",
      lPhase: lph[i], pressureLevel: (["PR2", "PR3", "PR3", "PR4", "PR4", "PR5"][i % 6]) as "PR2" | "PR3" | "PR4" | "PR5",
    })),
  });

  // 7. SG-insights
  await prisma.sgInsight.createMany({
    data: [
      { userId: player.id, category: "DISTANCE_GAPPING", severity: 4, title: "Gap mellom 8i og PW", body: "25m gap mellom 8-jern og PW (135m → 110m). Jevnere gapping anbefalt.", payload: { from: "8i", to: "PW", gapMeters: 25 } },
      { userId: player.id, category: "PROGRESSION_TREND", severity: 2, title: "Putt 5-10 ft forbedrer seg", body: "Fra -0.15 til +0.22 SG på putt 5-10 ft siste 4 uker.", payload: { metric: "sgPutt5_10", from: -0.15, to: 0.22 } },
      { userId: player.id, category: "TRAINING_GAP", severity: 3, title: "For lite Around-Green", body: "Kun 8% treningstid på AROUND_GREEN, anbefalt 15-20%.", payload: { area: "AROUND_GREEN", current: 8, target: 18 } },
    ],
  });

  // 8. Dagens program + uke (TrainingSessionV2 — det getHjemData faktisk leser) + turneringer
  await prisma.trainingSessionV2.deleteMany({ where: { studentId: player.id } });
  await prisma.tournamentEntry.deleteMany({ where: { userId: player.id } });

  const realNow = new Date();
  const at = (h: number, m: number, dayOffset = 0): Date => {
    const d = new Date(realNow);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
  };
  type DrillSeed = { name: string; durationMinutes: number; pyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" };
  const mkSession = async (s: {
    title: string; start: Date; end: Date; practiceType: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST";
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED"; miljo: "M0" | "M1" | "M2" | "M3" | "M4" | "M5"; drills: DrillSeed[];
  }) => {
    await prisma.trainingSessionV2.create({
      data: {
        title: s.title, studentId: player.id, coachId: player.id, startTime: s.start, endTime: s.end,
        miljo: s.miljo, practiceType: s.practiceType, status: s.status, isCoachCreated: true,
        drills: { create: s.drills.map((d, i) => ({ sortOrder: i, name: d.name, durationMinutes: d.durationMinutes, pyramide: d.pyramide })) },
      },
    });
  };

  // Dagens 3 økter (status styrer done/now/upcoming deterministisk)
  await mkSession({ title: "Mobility + speed-stick", start: at(7, 0), end: at(7, 50), practiceType: "BLOKK", status: "COMPLETED", miljo: "M1",
    drills: [{ name: "Dynamisk mobilitet", durationMinutes: 20, pyramide: "FYS" }, { name: "Speed-stick protokoll", durationMinutes: 30, pyramide: "FYS" }] });
  await mkSession({ title: "Stinger-drill · 150 m", start: at(14, 30), end: at(15, 15), practiceType: "RANDOM", status: "IN_PROGRESS", miljo: "M3",
    drills: [{ name: "Stinger 150 m", durationMinutes: 25, pyramide: "SLAG" }, { name: "Lav ball-flukt", durationMinutes: 12, pyramide: "TEK" }, { name: "Bane-flight", durationMinutes: 8, pyramide: "SLAG" }] });
  await mkSession({ title: "Putt 3 m · 30 forsøk", start: at(17, 0), end: at(17, 25), practiceType: "SPILL_TEST", status: "PLANNED", miljo: "M2",
    drills: [{ name: "3 m putt-test", durationMinutes: 25, pyramide: "SPILL" }] });

  // Fremtidige økter denne uka (for Planlegge/Workbench-tidslinjen) — PLANNED
  const fremRoll: Array<{ off: number; h: number; pyr: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"; pt: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST"; t: string }> = [
    { off: 1, h: 10, pyr: "SPILL", pt: "SPILL_TEST", t: "Putt-test · 3/6/9 m" },
    { off: 3, h: 15, pyr: "TEK", pt: "BLOKK", t: "Teknisk · P5–P6" },
    { off: 4, h: 9, pyr: "TURN", pt: "KONKURRANSE", t: "Runde 18 · Oslo GK" },
  ];
  for (const f of fremRoll) {
    await mkSession({ title: f.t, start: at(f.h, 0, f.off), end: at(f.h + 1, 0, f.off), practiceType: f.pt, status: "PLANNED", miljo: "M2",
      drills: [{ name: `${f.pyr}-drill`, durationMinutes: 45, pyramide: f.pyr }] });
  }

  // Uke-historikk for pyramide-vekting (siste 6 dager, fullførte)
  const weekRoll: Array<{ pyr: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"; pt: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST" }> = [
    { pyr: "TEK", pt: "BLOKK" }, { pyr: "SLAG", pt: "RANDOM" }, { pyr: "FYS", pt: "BLOKK" },
    { pyr: "SPILL", pt: "SPILL_TEST" }, { pyr: "TURN", pt: "KONKURRANSE" }, { pyr: "TEK", pt: "BLOKK" },
  ];
  for (let i = 0; i < weekRoll.length; i++) {
    const off = -(i + 1);
    await mkSession({ title: `Økt ${weekRoll[i].pyr.toLowerCase()}`, start: at(16, 0, off), end: at(17, 30, off), practiceType: weekRoll[i].pt, status: "COMPLETED", miljo: "M2",
      drills: [{ name: `${weekRoll[i].pyr}-blokk`, durationMinutes: 60, pyramide: weekRoll[i].pyr }, { name: `${weekRoll[i].pyr}-spill`, durationMinutes: 30, pyramide: weekRoll[i].pyr }] });
  }

  // To kommende turneringer (manuelle)
  await prisma.tournamentEntry.createMany({
    data: [
      { userId: player.id, manualName: "Oslo GK Klubbmesterskap", manualDate: at(9, 0, 5), category: "Klubb", priority: "NORMAL", entryStatus: "CONFIRMED" },
      { userId: player.id, manualName: "Sørlandsåpne", manualDate: at(9, 0, 20), category: "Srixon Tour", priority: "NORMAL", entryStatus: "PLANNED" },
    ],
  });

  // 8b. Club metric trends (TrackMan-fane på Analysere)
  await prisma.clubMetricTrend.deleteMany({ where: { userId: player.id } });
  const clubs = ["Driver", "3w", "5w", "5i", "7i", "PW"];
  await prisma.clubMetricTrend.createMany({
    data: clubs.flatMap((club, idx) =>
      Array.from({ length: 4 }, (_, w) => ({
        userId: player.id, club, weekStart: at(12, 0, -(w * 7)),
        avgClubPath: roundTo(rand(-2, 2), 2), avgFaceAngle: roundTo(rand(-2, 2), 2),
        avgSmash: roundTo(club === "Driver" ? rand(1.46, 1.5) : rand(1.32, 1.42), 3),
        avgTotal: roundTo([268, 242, 215, 196, 168, 120][idx] + rand(-4, 4), 1),
        sigmaBall: roundTo(rand(2.5, 6), 1), shotCount: Math.round(rand(20, 80)),
      })),
    ),
  });

  // 9. Coaching-abonnement (Performance Pro = 4 credits) → gratis app-tilgang via coaching.
  await prisma.subscription.upsert({
    where: { userId: player.id },
    update: { tier: "PRO", status: "ACTIVE", monthlyCredits: 4, creditsRemaining: 3 },
    create: { userId: player.id, tier: "PRO", status: "ACTIVE", monthlyCredits: 4, creditsRemaining: 3 },
  });

  // 10. Utstyrsbag (Meg → Utstyrsbag)
  await prisma.equipmentBag.upsert({
    where: { userId: player.id },
    update: {
      driver: "TSR3 · 9,5° · Stiff · 45,75\"", fairwayWoods: "TSR2 · 15° · Stiff", hybrids: "T-hybrid · 19°",
      irons: "T100 · 4–PW · Stiff", wedges: "Vokey SM10 · 50° · 54° · 58°", putter: "Newport 2 · 34\"",
      ball: "Pro V1x · 2024", bag: "Stand-bag · sort", notes: "Loft-justert driver −0,5° (mai)",
    },
    create: {
      userId: player.id,
      driver: "TSR3 · 9,5° · Stiff · 45,75\"", fairwayWoods: "TSR2 · 15° · Stiff", hybrids: "T-hybrid · 19°",
      irons: "T100 · 4–PW · Stiff", wedges: "Vokey SM10 · 50° · 54° · 58°", putter: "Newport 2 · 34\"",
      ball: "Pro V1x · 2024", bag: "Stand-bag · sort", notes: "Loft-justert driver −0,5° (mai)",
    },
  });

  // 11. Dokumenter (Meg → Dokumenter)
  await prisma.document.deleteMany({ where: { userId: player.id } });
  await prisma.document.createMany({
    data: [
      { userId: player.id, title: "Coaching-avtale 2026", url: "#", kind: "CONTRACT" },
      { userId: player.id, title: "Foreldresamtykke", url: "#", kind: "CONSENT" },
      { userId: player.id, title: "Personvern & GDPR", url: "#", kind: "PRIVACY" },
      { userId: player.id, title: "Faktura · mai 2026", url: "#", kind: "RECEIPT" },
      { userId: player.id, title: "Faktura · april 2026", url: "#", kind: "RECEIPT" },
      { userId: player.id, title: "Forbundslisens 2026", url: "#", kind: "LICENSE" },
    ],
  });


  // 12. Varsler (Varsler-skjermen) — blanding i dag / tidligere, noen uleste
  await prisma.notification.deleteMany({ where: { userId: player.id } });
  const naa = new Date();
  const minus = (t: number) => new Date(naa.getTime() - t);
  await prisma.notification.createMany({
    data: [
      { userId: player.id, type: "melding", title: "Anders Kristiansen", body: "«Bra økt i dag — se klippet jeg la i Videoer»", link: "/portal/coach", createdAt: minus(2 * 3600_000) },
      { userId: player.id, type: "plan", title: "Ny treningsplan · denne uka", body: "Anders la til 4 økter i planen din", link: "/portal/planlegge", createdAt: minus(5 * 3600_000) },
      { userId: player.id, type: "drill", title: "Putt-test torsdag kl 10", body: "Lagt i kalenderen din", link: "/portal/analysere", createdAt: minus(6 * 3600_000), readAt: minus(3600_000) },
      { userId: player.id, type: "turnering", title: "Klubbmesterskap — påmelding bekreftet", body: "Oslo GK", link: "/portal/tren/turneringer", createdAt: minus(30 * 3600_000), readAt: minus(20 * 3600_000) },
      { userId: player.id, type: "runde", title: "Ny innsikt klar", body: "3 funn fra siste 5 runder", link: "/portal/analysere", createdAt: minus(50 * 3600_000), readAt: minus(40 * 3600_000) },
      { userId: player.id, type: "booking", title: "Booking bekreftet", body: "Pro-time fredag 11:00", link: "/portal/booking", createdAt: minus(76 * 3600_000), readAt: minus(70 * 3600_000) },
    ],
  });


  // 13. Shots (hull-for-hull) på de 2 siste rundene — så runde-detalj viser scorecard
  const PAR18 = [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4];
  const sisteRunder = await prisma.round.findMany({ where: { userId: player.id }, orderBy: { playedAt: "desc" }, take: 2, select: { id: true } });
  for (const r of sisteRunder) {
    await prisma.shot.deleteMany({ where: { roundId: r.id } });
    const shots: { roundId: string; holeNumber: number; holePar: number; shotNumber: number; club: string | null; lie: "TEE" | "FAIRWAY" | "GREEN"; distanceToPin: number | null; distanceHit: number | null; shotType: "DRIVE" | "APPROACH" | "PUTT" }[] = [];
    for (let h = 1; h <= 18; h++) {
      const par = PAR18[h - 1];
      const score = Math.max(2, par + [(-1), 0, 0, 0, 1, 1, 2][Math.floor(rand(0, 7))]);
      for (let n = 1; n <= score; n++) {
        const erSiste2 = n > score - Math.min(2, score - 1);
        shots.push({
          roundId: r.id, holeNumber: h, holePar: par, shotNumber: n,
          club: n === 1 ? (par === 3 ? "7i" : "Driver") : erSiste2 ? "Putter" : "8i",
          lie: n === 1 ? "TEE" : erSiste2 ? "GREEN" : "FAIRWAY",
          distanceToPin: erSiste2 ? roundTo(rand(0, 4), 1) : roundTo(rand(20, 160), 1),
          distanceHit: roundTo(rand(2, 260), 1),
          shotType: n === 1 && par !== 3 ? "DRIVE" : erSiste2 ? "PUTT" : "APPROACH",
        });
      }
    }
    await prisma.shot.createMany({ data: shots });
  }

  // 14. markus@akgolf.no → ADMIN (begge roller: ADMIN er supersett av COACH).
  const markus = await prisma.user.findUnique({ where: { email: "markus@akgolf.no" }, select: { id: true, role: true, authId: true } });
  if (markus) {
    if (markus.role !== "ADMIN") {
      await prisma.user.update({ where: { email: "markus@akgolf.no" }, data: { role: "ADMIN" } });
      console.log(`markus@akgolf.no: rolle ${markus.role} → ADMIN`);
    } else {
      console.log("markus@akgolf.no: allerede ADMIN");
    }
    // hold auth-metadata i synk
    if (markus.authId) {
      await admin.auth.admin.updateUserById(markus.authId, { user_metadata: { role: "ADMIN" } }).catch(() => {});
    }
  } else {
    console.log("ADVARSEL: markus@akgolf.no finnes ikke — hopper over rolle-endring");
  }

  console.log(`\n✓ Ferdig. PlayerHQ-demo login: ${EMAIL} / ${PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
