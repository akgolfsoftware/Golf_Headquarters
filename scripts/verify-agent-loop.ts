/**
 * Gating verification for agent loop — executor accept + agent runs.
 * Usage: npx tsx scripts/verify-agent-loop.ts
 */
import "./_env";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "@/lib/agents/accept-plan-action";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runTrainingGap } from "@/lib/agents/training-gap";
import { runRoundAgent } from "@/lib/agents/round-agent";

const SCRATCH = process.env.SCRATCH ?? "/tmp/agent-loop-verify";

async function findDemoUser() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: "oyvind-rohjan" } },
        { name: { contains: "Øyvind" } },
      ],
    },
    select: { id: true, name: true, email: true },
  });
  return user;
}

async function verifyExecutorAccept(userId: string) {
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId, isActive: true },
    include: {
      sessions: {
        where: { status: "PLANNED", scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      },
    },
  });
  if (!plan) {
    return { skip: true, reason: "ingen aktiv plan" };
  }

  const beforeCount = plan.sessions.length;

  const action = await prisma.planAction.create({
    data: {
      userId,
      planId: plan.id,
      actionType: "SESSION_ADD",
      agentName: "verify-script",
      suggestion: {
        title: "Verifikasjonsøkt — agent-loop",
        pyramidArea: "TEK",
        skillArea: "TILNAERMING",
        durationMin: 45,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        forklaring: "Gating-test for executor",
      },
    },
  });

  const result = await acceptAndApplyPlanAction(action.id);

  const after = await prisma.trainingPlanSession.count({
    where: {
      planId: plan.id,
      status: "PLANNED",
      scheduledAt: { gte: new Date() },
    },
  });

  const accepted = await prisma.planAction.findUnique({
    where: { id: action.id },
    select: { status: true },
  });

  return {
    actionId: action.id,
    beforeCount,
    afterCount: after,
    acceptedStatus: accepted?.status,
    result,
    passed:
      result.status === "ACCEPTED" &&
      result.applied &&
      accepted?.status === "ACCEPTED" &&
      after >= beforeCount,
  };
}

async function verifyAgents(userId: string) {
  const beforePending = await prisma.planAction.count({
    where: { userId, status: "PENDING" },
  });

  const watcher = await runPlanWatcher();
  const gap = await runTrainingGap();
  const round = await runRoundAgent(userId);

  const afterPending = await prisma.planAction.count({
    where: { userId, status: "PENDING" },
  });

  const recent = await prisma.planAction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      actionType: true,
      status: true,
      agentName: true,
      createdAt: true,
    },
  });

  return {
    beforePending,
    afterPending,
    watcher,
    gap,
    round,
    recent,
  };
}

async function main() {
  const lines: string[] = [];
  const log = (s: string) => {
    console.log(s);
    lines.push(s);
  };

  log("=== Agent loop verification ===");
  log(`Time: ${new Date().toISOString()}`);

  const user = await findDemoUser();
  if (!user) {
    log("FAIL: Demo-bruker ikke funnet");
    process.exit(1);
  }
  log(`User: ${user.name} (${user.id})`);

  log("\n--- 1. Executor accept ---");
  try {
    const exec = await verifyExecutorAccept(user.id);
    log(JSON.stringify(exec, null, 2));
    if ("passed" in exec && exec.passed) {
      log("PASS: executor accept muterte plan");
    } else if ("skip" in exec) {
      log(`SKIP: ${exec.reason}`);
    } else {
      log("FAIL: executor accept");
    }
  } catch (err) {
    log(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
  }

  log("\n--- 2. Agent runs ---");
  try {
    const agents = await verifyAgents(user.id);
    log(JSON.stringify(agents, null, 2));
    log("PASS: agents kjørte uten feil");
  } catch (err) {
    log(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
  }

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(SCRATCH, { recursive: true });
  await fs.writeFile(
    path.join(SCRATCH, "executor-accept.log"),
    lines.filter((l) => l.includes("Executor") || l.includes("PASS") || l.includes("FAIL")).join("\n"),
  );
  await fs.writeFile(path.join(SCRATCH, "agent-apply.log"), lines.join("\n"));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});