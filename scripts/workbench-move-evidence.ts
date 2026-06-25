/**
 * Move-flyt bevis: flytt screentest-økt til annen dag, logg before/after scheduledAt, gjenopprett.
 * Bruker ren Prisma (som publish-evidence) — unngår server-only v2-sync i tsx-scripts.
 */
import "./_env";
import { appendFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  computeMoveTarget,
  dayIndexFromScheduledAt,
  mondayOf,
} from "../src/lib/workbench/session-move-math";

const OUT = process.argv[2] || "/tmp/workbench-flow.log";
const log = (line: string) => {
  appendFileSync(OUT, `[${new Date().toISOString()}] ${line}\n`);
  console.log(line);
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const refDate = new Date();
  const weekStart = mondayOf(refDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const player = await prisma.user.findUnique({
    where: { email: "screentest@akgolf.test" },
    select: { id: true },
  });
  if (!player) throw new Error("screentest ikke funnet");

  const session = await prisma.trainingPlanSession.findFirst({
    where: {
      plan: { userId: player.id },
      scheduledAt: { gte: weekStart, lt: weekEnd },
    },
    orderBy: { scheduledAt: "asc" },
    select: { id: true, scheduledAt: true },
  });
  if (!session) throw new Error("ingen økt i inneværende uke");

  const originalDay = dayIndexFromScheduledAt(session.scheduledAt, refDate);
  const targetDay = originalDay === 4 ? 1 : originalDay + 1;

  log(
    `MOVE_BEFORE sessionId=${session.id} scheduledAt=${session.scheduledAt.toISOString()} dayIndex=${originalDay}`,
  );

  const target = computeMoveTarget(session.scheduledAt, targetDay, refDate);
  await prisma.trainingPlanSession.update({
    where: { id: session.id },
    data: { scheduledAt: target },
  });

  const afterRow = await prisma.trainingPlanSession.findUnique({
    where: { id: session.id },
    select: { scheduledAt: true },
  });
  const afterDay = dayIndexFromScheduledAt(afterRow!.scheduledAt, refDate);
  const pass = afterDay === targetDay;
  log(
    `MOVE_AFTER scheduledAt=${afterRow!.scheduledAt.toISOString()} dayIndex=${afterDay} targetDay=${targetDay} ${pass ? "PASS" : "FAIL"}`,
  );
  if (!pass) throw new Error("MOVE_AFTER day mismatch");

  await prisma.trainingPlanSession.update({
    where: { id: session.id },
    data: { scheduledAt: session.scheduledAt },
  });
  log(`MOVE_RESTORE scheduledAt=${session.scheduledAt.toISOString()} PASS`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });