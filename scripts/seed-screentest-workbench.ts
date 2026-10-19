/**
 * Testdata for spillerens Workbench-nivåer (PH-11 År · Periode · Måned · Uke · Målsetninger) på
 * testkontoen screentest@akgolf.test, etter plan.html (pakke 3): Grunnperiode 1 uke 39–46 med timer
 * per akse, testuke 43 som hendelse, Spesialperiode og Ferie, ukeplaner fordelt fra perioden,
 * månedsplan for oktober og en konkurransedag tirsdag 17. november (Vinterserien 1; Klubbmesterskap innendørs er en økt, 16.10).
 *
 * Bare testkontoen. Idempotent: faste ID-er og upsert. Kjør: npx tsx scripts/seed-screentest-workbench.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type LPhase } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const EMAIL = "screentest@akgolf.test";
const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

type Akser = { FYS: number; TEK: number; SLAG: number; SPILL: number; TURN: number };
const GRUNN1: Akser = { FYS: 90, TEK: 180, SLAG: 225, SPILL: 350, TURN: 0 };
const GRUNN1_LETT: Akser = { FYS: 90, TEK: 120, SLAG: 150, SPILL: 240, TURN: 0 };
const SPES: Akser = { FYS: 90, TEK: 150, SLAG: 300, SPILL: 240, TURN: 0 };
const SPES_LETT: Akser = { FYS: 60, TEK: 90, SLAG: 180, SPILL: 150, TURN: 0 };
const FERIE: Akser = { FYS: 60, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };

const PERIODER: { id: string; lPhase: LPhase; start: string; slutt: string; fokus: string | null; akser: Akser | null; lett: Akser | null }[] = [
  { id: "screentest-GRUNN-2026", lPhase: "GRUNN", start: "2026-01-01", slutt: "2026-04-30", fokus: null, akser: null, lett: null },
  { id: "screentest-SPESIAL-2026", lPhase: "SPESIAL", start: "2026-05-01", slutt: "2026-06-30", fokus: null, akser: null, lett: null },
  { id: "screentest-TURNERING-2026", lPhase: "TURNERING", start: "2026-07-01", slutt: "2026-09-20", fokus: null, akser: null, lett: null },
  { id: "screentest-GRUNN1H-2026", lPhase: "GRUNN", start: "2026-09-21", slutt: "2026-11-15", fokus: "Innspill 100–150 m og nærspill", akser: GRUNN1, lett: GRUNN1_LETT },
  { id: "screentest-TESTUKE-2026", lPhase: "TESTUKE", start: "2026-10-19", slutt: "2026-10-25", fokus: "Testuke", akser: null, lett: null },
  { id: "screentest-SPESIAL2H-2026", lPhase: "SPESIAL", start: "2026-11-16", slutt: "2026-12-13", fokus: "Slag under press", akser: SPES, lett: SPES_LETT },
  { id: "screentest-FERIE-2026", lPhase: "FERIE", start: "2026-12-14", slutt: "2026-12-31", fokus: null, akser: FERIE, lett: FERIE },
];

/** ISO-uker 2026 med periodens timer: lette uker er 39 og 46 (Grunnperiode 1) og 50 (Spesialperiode). */
const UKER: { uke: number; akser: Akser }[] = [
  ...[39, 40, 41, 42, 43, 44, 45, 46].map((uke) => ({ uke, akser: uke === 39 || uke === 46 ? GRUNN1_LETT : GRUNN1 })),
  ...[47, 48, 49, 50].map((uke) => ({ uke, akser: uke === 50 ? SPES_LETT : SPES })),
];

async function main() {
  const user = await prisma.user.findFirst({ where: { email: EMAIL }, select: { id: true } });
  if (!user) throw new Error(`Fant ikke ${EMAIL}. Kjør scripts/seed-screentest.ts først.`);
  const sesong = await prisma.seasonPlan.upsert({
    where: { userId_year: { userId: user.id, year: 2026 } },
    create: { userId: user.id, year: 2026, name: "Sesong 2026", startDate: d("2026-01-01"), endDate: d("2026-12-31") },
    update: {},
  });

  for (const p of PERIODER) {
    const data = {
      seasonPlanId: sesong.id, lPhase: p.lPhase, startDate: d(p.start), endDate: d(p.slutt), focus: p.fokus,
      axisMinutes: p.akser ?? undefined, axisMinutesLight: p.lett ?? undefined,
    };
    await prisma.periodBlock.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });
  }

  for (const { uke, akser } of UKER) {
    const timer = {
      plannedHoursFys: akser.FYS / 60, plannedHoursTek: akser.TEK / 60, plannedHoursSlag: akser.SLAG / 60,
      plannedHoursSpill: akser.SPILL / 60, plannedHoursTurn: akser.TURN / 60,
    };
    await prisma.weekPlan.upsert({
      where: { playerId_isoYear_weekNumber: { playerId: user.id, isoYear: 2026, weekNumber: uke } },
      create: { playerId: user.id, seasonPlanId: sesong.id, isoYear: 2026, weekNumber: uke, ...timer },
      update: timer,
    });
  }

  const mnd = { focus: "Innspill 100–150 m og nærspill", notes: "Testuke 19.–25. oktober. Innspilltest og fysiske tester." };
  await prisma.monthPlan.upsert({
    where: { userId_year_month: { userId: user.id, year: 2026, month: 10 } },
    create: { userId: user.id, seasonPlanId: sesong.id, year: 2026, month: 10, createdById: user.id, ...mnd },
    update: mnd,
  });

  const turnering = {
    playerId: user.id, coachId: user.id, createdBy: user.id, title: "Vinterserien 1", status: "PUBLISHED",
    focus: "UTVIKLING", startDate: d("2026-11-17"), endDate: d("2026-11-17"), location: "Oslo GK", holes: 18,
  };
  await prisma.workbenchTournamentPlan.upsert({ where: { id: "screentest-wb-km-innendors" }, create: { id: "screentest-wb-km-innendors", ...turnering }, update: turnering });

  console.log("Workbench-testdata lagt inn for", EMAIL);
}

main().finally(() => prisma.$disconnect());
