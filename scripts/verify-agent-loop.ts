/**
 * Gating verification steps 1 + 3 (DB executor + agents produce PlanActions).
 * Step 4 (UI approve) lives in verify-godkjenninger-ui.ts
 */
import "./_env";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "@/lib/agents/accept-plan-action";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runTrainingGap } from "@/lib/agents/training-gap";
import { runRoundAgent } from "@/lib/agents/round-agent";
import { aggregateSg } from "@/lib/sg";
import { runWeaknessSkill } from "@/lib/training/skills";
import { startOfWeek } from "@/lib/uke-helpers";

const SCRATCH =
  process.env.SCRATCH ??
  "/var/folders/nw/zq6jwb211dn7q6rbv5vr1bwh0000gn/T/grok-goal-3410cbd91df7/implementer";

const lines: string[] = [];
function log(...parts: unknown[]) {
  const line = parts
    .map((p) => (typeof p === "string" ? p : JSON.stringify(p, null, 2)))
    .join(" ");
  console.log(line);
  lines.push(line);
}

async function findDemoUser() {
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: "oyvind-rohjan" } },
        { name: { contains: "Øyvind" } },
      ],
    },
    select: { id: true, name: true, email: true },
  });
}

async function snapshotPlan(planId: string) {
  const sessions = await prisma.trainingPlanSession.findMany({
    where: {
      planId,
      scheduledAt: { gte: new Date() },
      status: "PLANNED",
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      title: true,
      pyramidArea: true,
      skillArea: true,
      scheduledAt: true,
      drills: { select: { exerciseId: true } },
    },
  });
  return sessions;
}

async function verifyExecutorAccept(userId: string) {
  log("\n=== STEP 1: Executor accept (PYRAMID_ADJUST) ===");

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  if (!plan) {
    log("SKIP: ingen aktiv plan");
    return false;
  }

  const before = await snapshotPlan(plan.id);
  log("BEFORE sessions:", before);

  const action = await prisma.planAction.create({
    data: {
      userId,
      planId: plan.id,
      actionType: "PYRAMID_ADJUST",
      agentName: "verify-script",
      suggestion: {
        omrade: "FYS",
        forklaring: "Gating-test PYRAMID_ADJUST",
      },
    },
  });

  const result = await acceptAndApplyPlanAction(action.id);
  log("acceptAndApplyPlanAction:", result);

  const after = await snapshotPlan(plan.id);
  log("AFTER sessions:", after);

  const status = await prisma.planAction.findUnique({
    where: { id: action.id },
    select: { status: true },
  });

  const passed =
    result.applied &&
    status?.status === "ACCEPTED" &&
    after.length > before.length &&
    after.some((s) => s.drills.length > 0);

  log(passed ? "PASS step 1" : "FAIL step 1");
  return passed;
}

async function seedRoundAgentConditions(userId: string) {
  await prisma.planAction.deleteMany({
    where: {
      userId,
      actionType: "FOCUS_CHANGE",
      status: "PENDING",
      agentName: "round-agent",
    },
  });

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);
  const runder = await prisma.round.findMany({
    where: { userId, playedAt: { gte: tretti } },
  });
  const sg = aggregateSg(runder);
  const weakness = runWeaknessSkill({
    sgSnitt: {
      OTT: sg.ott ?? 0,
      APP: sg.app ?? 0,
      ARG: sg.arg ?? 0,
      PUTT: sg.putt ?? 0,
    },
    pyramidSessions: [],
  });
  log("round-agent pre-check weakness:", weakness);

  if (weakness.sgValue >= -0.5) {
    const course = await prisma.courseDefinition.findFirst({
      select: { id: true },
    });
    if (course) {
      await prisma.round.create({
        data: {
          userId,
          courseId: course.id,
          playedAt: new Date(),
          score: 85,
          sgTotal: -3,
          sgOtt: 0.2,
          sgApp: 0.1,
          sgArg: 0.0,
          sgPutt: -2.8,
        },
      });
      log("Seeded round with sgPutt=-2.8 for round-agent trigger");
    }
  }
}

async function seedTrainingGapConditions(userId: string) {
  await prisma.planAction.deleteMany({
    where: {
      userId,
      actionType: "TRAINING_GAP",
      status: "PENDING",
      agentName: "training-gap",
    },
  });

  const now = new Date();
  const markor = "verify-gap-seed";
  const eks = await prisma.trainingLog.findFirst({
    where: { userId, notes: markor },
  });
  if (!eks) {
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 3);
      await prisma.trainingLog.create({
        data: {
          userId,
          date: d,
          sgArea: "OTT",
          minutes: 90,
          notes: markor,
        },
      });
    }
    await prisma.trainingLog.create({
      data: {
        userId,
        date: now,
        sgArea: "PUTT",
        minutes: 5,
        notes: markor,
      },
    });
    log("Seeded training logs: 540min OTT, 5min PUTT");
  }
}

async function seedPlanWatcherGap(userId: string, planId: string) {
  const idag = new Date();
  const ukestart = startOfWeek(idag);
  const forrigeStart = new Date(ukestart);
  forrigeStart.setDate(forrigeStart.getDate() - 7);
  const forrigeMid = new Date(forrigeStart);
  forrigeMid.setDate(forrigeMid.getDate() + 2);

  const markor = "verify-watcher-seed";
  const eks = await prisma.trainingPlanSession.findFirst({
    where: { planId, title: { contains: markor } },
  });
  if (!eks) {
    await prisma.trainingPlanSession.create({
      data: {
        planId,
        title: `${markor} FYS`,
        scheduledAt: forrigeMid,
        durationMin: 180,
        pyramidArea: "FYS",
        skillArea: "SPILL",
        status: "COMPLETED",
        lPhase: "GRUNN",
      },
    });
  }
}

async function verifyAgentsProduceActions(userId: string) {
  log("\n=== STEP 3: Agents produce PENDING PlanActions ===");

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  if (!plan) return false;

  await seedPlanWatcherGap(userId, plan.id);
  await seedRoundAgentConditions(userId);
  await seedTrainingGapConditions(userId);

  const watcher = await runPlanWatcher();
  const gap = await runTrainingGap();
  const round = await runRoundAgent(userId);

  log("runPlanWatcher:", watcher);
  log("runTrainingGap:", gap);
  log("runRoundAgent:", round);

  const nye = await prisma.planAction.findMany({
    where: {
      userId,
      agentName: { in: ["plan-watcher", "training-gap", "round-agent"] },
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, actionType: true, agentName: true, createdAt: true },
  });
  log("PENDING from agents:", nye);

  const passed =
    (watcher.planActionsWritten ?? 0) > 0 &&
    (gap.planActionsWritten ?? 0) > 0 &&
    (round.planActionsWritten ?? 0) > 0;

  log(passed ? "PASS step 3" : "FAIL step 3");
  return passed;
}

async function main() {
  log("=== verify-agent-loop.ts ===");
  log("Time:", new Date().toISOString());

  const user = await findDemoUser();
  if (!user) {
    log("FAIL: demo-bruker ikke funnet");
    process.exit(1);
  }
  log("User:", user.name, user.id);

  const s1 = await verifyExecutorAccept(user.id);
  const s3 = await verifyAgentsProduceActions(user.id);

  await mkdir(SCRATCH, { recursive: true });
  const full = lines.join("\n");
  await writeFile(join(SCRATCH, "executor-accept.log"), full);
  await writeFile(join(SCRATCH, "agent-apply.log"), full);

  await prisma.$disconnect();
  if (!s1 || !s3) process.exit(1);
  log("\nSTEPS 1+3 PASSED (step 4 = verify-godkjenninger-ui.ts)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});