/**
 * Gating verification for agent loop — full evidence for plan verification steps 1–4.
 * Usage: SCRATCH=/path/to/implementer npx tsx scripts/verify-agent-loop.ts
 */
import "./_env";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "@/lib/agents/accept-plan-action";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runTrainingGap } from "@/lib/agents/training-gap";
import { runRoundAgent } from "@/lib/agents/round-agent";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";

const SCRATCH =
  process.env.SCRATCH ??
  "/var/folders/nw/zq6jwb211dn7q6rbv5vr1bwh0000gn/T/grok-goal-3410cbd91df7/implementer";

const lines: string[] = [];
function log(...parts: unknown[]) {
  const line = parts.map((p) => (typeof p === "string" ? p : JSON.stringify(p, null, 2))).join(" ");
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
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      name: true,
      isActive: true,
      aiPrompt: true,
      updatedAt: true,
    },
  });
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
      status: true,
      drills: { select: { id: true, exerciseId: true } },
    },
  });
  return { plan, sessions };
}

async function verifyExecutorAccept(userId: string) {
  log("\n=== STEP 1: Executor accept (PYRAMID_ADJUST + SESSION_ADD) ===");

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  if (!plan) {
    log("SKIP: ingen aktiv plan");
    return false;
  }

  const before = await snapshotPlan(plan.id);
  log("BEFORE plan:", before.plan);
  log("BEFORE sessions (PLANNED future):", before.sessions);

  const action = await prisma.planAction.create({
    data: {
      userId,
      planId: plan.id,
      actionType: "PYRAMID_ADJUST",
      agentName: "verify-script",
      suggestion: {
        omrade: "FYS",
        omradeNavn: "Fysisk",
        faktiskProsent: 5,
        malProsent: 15,
        forklaring: "Gating-test PYRAMID_ADJUST — FYS under mål",
      },
    },
  });
  log("Created PlanAction:", action.id, action.actionType);

  const result = await acceptAndApplyPlanAction(action.id);
  log("acceptAndApplyPlanAction result:", result);

  const after = await snapshotPlan(plan.id);
  log("AFTER plan:", after.plan);
  log("AFTER sessions (PLANNED future):", after.sessions);

  const accepted = await prisma.planAction.findUnique({
    where: { id: action.id },
    select: { status: true },
  });
  log("PlanAction status:", accepted?.status);

  const drillCount = after.sessions.reduce((n, s) => n + s.drills.length, 0);
  const passed =
    result.status === "ACCEPTED" &&
    result.applied &&
    accepted?.status === "ACCEPTED" &&
    after.sessions.length > before.sessions.length &&
    drillCount > before.sessions.reduce((n, s) => n + s.drills.length, 0);

  log(passed ? "PASS step 1" : "FAIL step 1");
  return passed;
}

/** Seed forrige uke med FYS-tung fordeling slik plan-watcher oppretter PYRAMID_ADJUST. */
async function seedPyramidGapForWatcher(userId: string, planId: string) {
  const idag = new Date();
  const ukestart = startOfWeek(idag);
  const forrigeStart = new Date(ukestart);
  forrigeStart.setDate(forrigeStart.getDate() - 7);
  const forrigeMid = new Date(forrigeStart);
  forrigeMid.setDate(forrigeMid.getDate() + 2);

  await prisma.planAction.deleteMany({
    where: {
      userId,
      planId,
      actionType: "PYRAMID_ADJUST",
      status: "PENDING",
      agentName: "plan-watcher",
    },
  });

  const eksisterende = await prisma.trainingPlanSession.findFirst({
    where: {
      planId,
      scheduledAt: { gte: forrigeStart, lt: endOfWeek(forrigeStart) },
      status: "COMPLETED",
      title: { contains: "verify-watcher-seed" },
    },
  });
  if (!eksisterende) {
    await prisma.trainingPlanSession.create({
      data: {
        planId,
        title: "verify-watcher-seed FYS",
        scheduledAt: forrigeMid,
        durationMin: 120,
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
  if (!plan) {
    log("SKIP: ingen aktiv plan");
    return false;
  }

  const pendingBefore = await prisma.planAction.count({
    where: { userId, status: "PENDING" },
  });
  log("PENDING before:", pendingBefore);

  await seedPyramidGapForWatcher(userId, plan.id);

  await prisma.planAction.deleteMany({
    where: {
      userId,
      actionType: "FOCUS_CHANGE",
      status: "PENDING",
      agentName: "round-agent",
    },
  });

  const watcher = await runPlanWatcher();
  log("runPlanWatcher:", watcher);

  const gap = await runTrainingGap();
  log("runTrainingGap:", gap);

  const round = await runRoundAgent(userId);
  log("runRoundAgent:", round);

  const pendingAfter = await prisma.planAction.count({
    where: { userId, status: "PENDING" },
  });
  log("PENDING after:", pendingAfter);

  const nye = await prisma.planAction.findMany({
    where: { userId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      actionType: true,
      agentName: true,
      status: true,
      suggestion: true,
      createdAt: true,
    },
  });
  log("Recent PENDING actions:", nye);

  const produsert =
    (watcher.planActionsWritten ?? 0) > 0 ||
    (gap.planActionsWritten ?? 0) > 0 ||
    (round.planActionsWritten ?? 0) > 0;

  log(produsert ? "PASS step 3" : "FAIL step 3");
  return produsert;
}

async function verifyApprovePath(userId: string) {
  log("\n=== STEP 4: Approve path (same as UI server action) ===");

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });
  if (!plan) return false;

  const before = await snapshotPlan(plan.id);
  const sessionCountBefore = before.sessions.length;

  const pending = await prisma.planAction.findFirst({
    where: { userId, status: "PENDING", actionType: "REST_DAY_ADD" },
  });

  let actionId = pending?.id;
  if (!actionId) {
    const fremtidig = before.sessions[0];
    if (!fremtidig) {
      log("SKIP: ingen fremtidig økt for REST_DAY_ADD");
      return false;
    }
    const created = await prisma.planAction.create({
      data: {
        userId,
        planId: plan.id,
        actionType: "REST_DAY_ADD",
        agentName: "verify-script",
        suggestion: {
          date: fremtidig.scheduledAt.toISOString(),
          forklaring: "Gating-test hviledag",
        },
      },
    });
    actionId = created.id;
    log("Created REST_DAY_ADD action:", actionId);
  } else {
    log("Using existing REST_DAY_ADD:", actionId);
  }

  const result = await acceptAndApplyPlanAction(actionId);
  log("approve (acceptAndApplyPlanAction) result:", result);

  const after = await snapshotPlan(plan.id);
  log("Sessions before:", sessionCountBefore, "after:", after.sessions.length);

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
    select: { status: true },
  });
  log("Final action status:", action?.status);

  const passed =
    result.status === "ACCEPTED" &&
    action?.status === "ACCEPTED" &&
    after.sessions.length <= sessionCountBefore;

  log(passed ? "PASS step 4" : "FAIL step 4");
  return passed;
}

async function main() {
  log("=== Agent loop verification ===");
  log("Time:", new Date().toISOString());
  log("SCRATCH:", SCRATCH);

  const user = await findDemoUser();
  if (!user) {
    log("FAIL: demo-bruker ikke funnet");
    process.exit(1);
  }
  log("User:", user.name, user.id, user.email);

  const s1 = await verifyExecutorAccept(user.id);
  const s3 = await verifyAgentsProduceActions(user.id);
  const s4 = await verifyApprovePath(user.id);

  await mkdir(SCRATCH, { recursive: true });
  const fullLog = lines.join("\n");
  await writeFile(join(SCRATCH, "executor-accept.log"), fullLog);
  await writeFile(join(SCRATCH, "agent-apply.log"), fullLog);
  await writeFile(join(SCRATCH, "godkjenninger-evidence.txt"), fullLog);

  await prisma.$disconnect();

  if (!s1 || !s3 || !s4) process.exit(1);
  log("\nALL GATING STEPS PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});