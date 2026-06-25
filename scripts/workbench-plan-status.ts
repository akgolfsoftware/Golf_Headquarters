/**
 * Les aktiv plan-status for spiller — gate bruker før/etter UI publish.
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/workbench-plan-status.ts <email>");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    console.error("NOT_FOUND user");
    process.exit(1);
  }
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true, status: true },
  });
  if (!plan) {
    console.error("NOT_FOUND plan");
    process.exit(1);
  }
  console.log(`planId=${plan.id} status=${plan.status}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });