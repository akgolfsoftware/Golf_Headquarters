import { NextRequest, NextResponse } from "next/server";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { runCalendarSync } from "@/lib/agents/calendar-sync";

export async function POST(req: NextRequest) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const formData = await req.formData();
  const model = formData.get("model") as string;
  const repo = formData.get("repo") as string;
  const task = formData.get("task") as string;

  // Log as AgentRun
  const run = await prisma.agentRun.create({
    data: {
      agentName: `ai-code-session-${model}`,
      status: "PENDING",
      duration: 0,
      output: { repo, task, model, note: "Task queued for code session" } as Prisma.InputJsonValue,
      userId: user.id,
    },
  });

  // Create a PlanAction for the code task (integrates with existing agent system)
  await prisma.planAction.create({
    data: {
      actionType: "AI_CODE_SESSION",
      suggestion: { model, repo, task, runId: run.id } as Prisma.InputJsonValue,
      status: "PENDING",
      agentName: `ai-${model}`,
      userId: user.id,
    },
  });

  // Trigge ekte agenter basert på task (real agents 24/7) - produserer alle
  try {
    await runCalendarSync();
    if (task.toLowerCase().includes('booking') || task.toLowerCase().includes('availability')) {
      const { runBookingOptimizer } = await import("@/lib/agents/booking-optimizer");
      await runBookingOptimizer();
      const { runAvailabilityGapFiller } = await import("@/lib/agents/availability-gap-filler");
      await runAvailabilityGapFiller();
      const { runDemandPredictor } = await import("@/lib/agents/demand-predictor");
      await runDemandPredictor();
    }
    if (task.toLowerCase().includes('monitor') || task.toLowerCase().includes('24') || task.toLowerCase().includes('conflict')) {
      const { runAvailabilityMonitor } = await import("@/lib/agents/availability-24-7-monitor");
      await runAvailabilityMonitor();
      const { runBookingConflictMonitor } = await import("@/lib/agents/booking-conflict-monitor");
      await runBookingConflictMonitor();
      const { runProactiveBookingAlerts } = await import("@/lib/agents/booking-alerts-proactive");
      await runProactiveBookingAlerts();
    }
    if (task.toLowerCase().includes('code') || task.toLowerCase().includes('review')) {
      const { runAiCodeReviewer } = await import("@/lib/agents/ai-code-reviewer");
      await runAiCodeReviewer();
    }
  } catch (_e) {
    // ignore if fails
  }

  return NextResponse.redirect(new URL(`/admin/agents?session=${run.id}&task=${encodeURIComponent(task)}`, req.url));
}
