/**
 * Publish-flyt bevis: DRAFT → PENDING_PLAYER for screentest-spiller.
 */
import "./_env";
import { appendFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const OUT = process.argv[2] || "/tmp/workbench-flow.log";
const log = (line: string) => {
  appendFileSync(OUT, `[${new Date().toISOString()}] ${line}\n`);
  console.log(line);
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const player = await prisma.user.findUnique({
    where: { email: "screentest@akgolf.test" },
    select: { id: true },
  });
  if (!player) throw new Error("screentest ikke funnet");

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: player.id },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true, status: true },
  });
  if (!plan) throw new Error("ingen plan");

  const before = plan.status;
  log(`PUBLISH_BEFORE status=${before} planId=${plan.id}`);

  // Sett midlertidig til DRAFT for å teste publish-løpet (gjenopprettes etterpå).
  await prisma.trainingPlan.update({
    where: { id: plan.id },
    data: { status: "DRAFT" },
  });

  // Speil publish-actions uten Next request/cookies (server action kan ikke kalles fra tsx).
  const planRow = await prisma.trainingPlan.findUnique({
    where: { id: plan.id },
    select: { id: true, name: true, userId: true, status: true },
  });
  if (!planRow || !["DRAFT", "REJECTED"].includes(planRow.status)) {
    throw new Error(`plan ikke publiserbar: ${planRow?.status}`);
  }

  await prisma.trainingPlan.update({
    where: { id: plan.id },
    data: { status: "PENDING_PLAYER", playerComment: null },
  });

  await prisma.notification.create({
    data: {
      userId: planRow.userId,
      type: "plan",
      title: "Ny treningsplan venter på godkjenning",
      body: `Planen «${planRow.name}» er sendt til deg. Åpne Workbench for å godkjenne.`,
      link: "/portal/planlegge/workbench",
    },
  });
  log("PUBLISH_ACTION ok=true status=PENDING_PLAYER");

  const after = await prisma.trainingPlan.findUnique({
    where: { id: plan.id },
    select: { status: true },
  });
  log(`PUBLISH_AFTER status=${after?.status} ${after?.status === "PENDING_PLAYER" ? "PASS" : "FAIL"}`);

  const notif = await prisma.notification.findFirst({
    where: { userId: player.id, type: "plan" },
    orderBy: { createdAt: "desc" },
    select: { title: true, link: true },
  });
  log(`NOTIFICATION title=${notif?.title ?? "—"} link=${notif?.link ?? "—"} ${notif ? "PASS" : "FAIL"}`);

  // Gjenopprett ACTIVE for demo (spiller har godkjent plan i seed).
  await prisma.trainingPlan.update({
    where: { id: plan.id },
    data: { status: "ACTIVE" },
  });
  log("PUBLISH_RESTORE status=ACTIVE");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });