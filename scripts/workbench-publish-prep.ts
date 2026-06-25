/**
 * Forbered/restore plan-status for publish UI-bevis (screentest-spiller).
 * Kjør: npx tsx scripts/workbench-publish-prep.ts [set-draft|restore-active]
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const mode = process.argv[2] ?? "set-draft";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const player = await prisma.user.findUnique({
    where: { email: "screentest@akgolf.test" },
    select: { id: true },
  });
  if (!player) throw new Error("screentest ikke funnet");

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: player.id, isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, status: true },
  });
  if (!plan) throw new Error("ingen aktiv plan");

  const target = mode === "restore-active" ? "ACTIVE" : "DRAFT";
  await prisma.trainingPlan.update({
    where: { id: plan.id },
    data: { status: target },
  });
  console.log(`PLAN_PREP planId=${plan.id} ${plan.status} → ${target} PASS`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());