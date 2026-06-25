/**
 * Les scheduledAt for en TrainingPlanSession — brukes av gate for drag before/after DB-bevis.
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { dayIndexFromScheduledAt } from "../src/lib/workbench/session-move-math";

const sessionId = process.argv[2];
if (!sessionId) {
  console.error("Usage: npx tsx scripts/workbench-session-at.ts <sessionId>");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const row = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { scheduledAt: true },
  });
  if (!row) {
    console.error("NOT_FOUND");
    process.exit(1);
  }
  const dayIndex = dayIndexFromScheduledAt(row.scheduledAt);
  console.log(`${row.scheduledAt.toISOString()} dayIndex=${dayIndex}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });