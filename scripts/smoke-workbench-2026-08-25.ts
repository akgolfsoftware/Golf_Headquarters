/**
 * Smoke for Workbench-kjernen (natt-plan 25.08.2026, Loop 1).
 *
 * create → move → publish → loadPlayerDay ser den, DRAFT-søsken usynlig.
 *
 * FORUTSETNING: tabellene finnes. Kjør DDL-en først:
 *   npx tsx scripts/add-workbench-sessions-2026-08-25.ts
 *
 * Skriver og RYDDER OPP etter seg. Krever to ekte bruker-IDer:
 *   WB_PLAYER_ID=<id> WB_COACH_ID=<id> npx tsx scripts/smoke-workbench-2026-08-25.ts
 *
 * Personvern: logger kun IDer, aldri navn.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

if (!process.env.WB_PLAYER_ID || !process.env.WB_COACH_ID) {
  console.error("Sett WB_PLAYER_ID og WB_COACH_ID.");
  process.exit(1);
}
const playerId: string = process.env.WB_PLAYER_ID;
const coachId: string = process.env.WB_COACH_ID;

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const DATO = new Date(Date.UTC(2026, 7, 24)); // 2026-08-24, mandag
const FLYTTET = new Date(Date.UTC(2026, 7, 25));

async function main() {
  const felles = {
    playerId,
    coachId,
    date: DATO,
    durationMinutes: 60,
    pyramid: "TEK",
    createdBy: "COACH",
    origin: "COACH",
  };

  const publisert = await prisma.workbenchSession.create({
    data: { ...felles, startMinute: 540, title: "SMOKE publisert" },
  });
  const utkast = await prisma.workbenchSession.create({
    data: { ...felles, date: FLYTTET, startMinute: 720, title: "SMOKE utkast" },
  });
  console.log("1. opprettet:", publisert.id, publisert.status, "|", utkast.id, utkast.status);

  const flyttet = await prisma.workbenchSession.update({
    where: { id: publisert.id },
    data: { date: FLYTTET, startMinute: 600 },
  });
  console.log("2. flyttet:", flyttet.date.toISOString().slice(0, 10), flyttet.startMinute);

  const pub = await prisma.workbenchSession.update({
    where: { id: publisert.id },
    data: { status: "PUBLISHED", publishedAt: new Date(), publishedBy: coachId },
  });
  console.log("3. publisert:", pub.status, pub.publishedAt?.toISOString());

  const spillerDag = await prisma.workbenchSession.findMany({
    where: {
      playerId,
      date: FLYTTET,
      status: { in: ["PUBLISHED", "IN_PROGRESS", "COMPLETED"] },
    },
    select: { id: true, status: true },
  });
  console.log("4. loadPlayerDay:", spillerDag);

  const ok =
    spillerDag.length === 1 &&
    spillerDag[0].id === publisert.id &&
    !spillerDag.some((s) => s.status === "DRAFT");
  console.log(ok ? "SMOKE OK — DRAFT-søsken usynlig" : "SMOKE FEILET");

  await prisma.workbenchSession.deleteMany({
    where: { id: { in: [publisert.id, utkast.id] } },
  });
  console.log("5. ryddet opp");
  if (!ok) process.exit(1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
