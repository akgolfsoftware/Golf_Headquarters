// Cron-endpoint for agenter. Beskyttes via CRON_SECRET-header (Vercel Cron
// sender automatisk Authorization: Bearer <CRON_SECRET>).

import { NextResponse } from "next/server";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runWeeklyPlanProposals } from "@/lib/agents/weekly-plan-proposals";
import { runChurnRadar } from "@/lib/agents/churn-radar";
import { runBetalingsPurring } from "@/lib/agents/betalings-purring";
import { runUkesoppsummering } from "@/lib/agents/ukesoppsummering";
import { runBookingReminders } from "@/lib/agents/booking-reminders";
import { runCleanupRecordings } from "@/lib/agents/cleanup-recordings";
import { runRefreshCalendarWatches } from "@/lib/agents/refresh-calendar-watches";
import { runCalendarSync } from "@/lib/agents/calendar-sync";
import { runTrainingGap } from "@/lib/agents/training-gap";
import { runSgInsights } from "@/lib/sg-hub/insight-engine";
import { syncDataGolf } from "@/lib/sg-hub/datagolf-sync";
import { runClubTrends } from "@/lib/sg-hub/club-trend-aggregator";
import { runBenchmarkSync } from "@/lib/admin/benchmark-sync";
import {
  syncDataGolfSchedules,
  syncNorwegianPlayers,
  syncLiveLeaderboards,
  syncNgfSchedule,
} from "@/lib/turneringer/sync";
import { syncPgaSkillRatings, syncPgaPuttDistance, syncPgaApproach } from "@/lib/stats/pga-sync";
import {
  runMorgenbrief,
  runKveldsjournal,
  runLoftesjekk,
  runCrmNudge,
} from "@/lib/meg/briefs";
import { runCaddieProactive } from "@/lib/agents/caddie-proactive";
import { triggerTurneringAgent } from "@/lib/agents/triggers";
import { runDailyBrief } from "@/lib/agents/daily-brief-agent";
import { runDrillForslag } from "@/lib/agents/drill-forslag-agent";
import { runBookingOptimizer } from "@/lib/agents/booking-optimizer";
import { runAvailabilityMonitor } from "@/lib/agents/availability-24-7-monitor";
import { runAvailabilityGapFiller } from "@/lib/agents/availability-gap-filler";
import { runBookingConflictMonitor } from "@/lib/agents/booking-conflict-monitor";
import { runAiCodeReviewer } from "@/lib/agents/ai-code-reviewer";
import { runDemandPredictor } from "@/lib/agents/demand-predictor";
import { runProactiveBookingAlerts } from "@/lib/agents/booking-alerts-proactive";
import { runPlanEffectivenessAgent } from "@/lib/agents/plan-effectiveness-agent";

export const runtime = "nodejs";
export const maxDuration = 300;

const AGENTS: Record<string, () => Promise<unknown>> = {
  "plan-watcher": runPlanWatcher,
  "weekly-plan-proposals": runWeeklyPlanProposals,
  "churn-radar": runChurnRadar,
  "betalings-purring": () => runBetalingsPurring(),
  ukesoppsummering: runUkesoppsummering,
  "booking-reminders": runBookingReminders,
  "cleanup-recordings": runCleanupRecordings,
  "refresh-calendar-watches": runRefreshCalendarWatches,
  "calendar-sync": runCalendarSync,
  "training-gap": runTrainingGap,
  "sg-insights": runSgInsights,
  "datagolf-sync": syncDataGolf,
  "club-trends": runClubTrends,
  // NGF-testfasiter — ukentlig DataGolf-drift (mandager 08:00 norsk tid)
  "benchmark-sync": runBenchmarkSync,
  // /turneringer-syncs
  "turneringer-schedule": syncDataGolfSchedules,
  "turneringer-players": syncNorwegianPlayers,
  "turneringer-live": syncLiveLeaderboards,
  "turneringer-ngf": syncNgfSchedule,
  // /stats/pga sync (Fase 2 — ukentlig)
  "pga-skill-ratings": syncPgaSkillRatings,
  "pga-putt-distance": syncPgaPuttDistance,
  "pga-approach": syncPgaApproach,
  // Meg-assistent proaktive briefer (Fase 6)
  "meg-morgenbrief": runMorgenbrief,
  "meg-kveldsjournal": runKveldsjournal,
  "meg-loftesjekk": runLoftesjekk,
  "meg-crm-nudge": runCrmNudge,
  // Proaktiv Caddie (Fase 3) — inaktive spillere → forslag i Caddie-dashbordet
  "caddie-proactive": runCaddieProactive,
  "turnering-agent": triggerTurneringAgent,
  // Selvgående golf-agenter koblet til Mission Control + varsling
  "daily-brief": runDailyBrief,
  "drill-forslag": runDrillForslag,
  "booking-optimizer": runBookingOptimizer,
  "availability-24-7-monitor": runAvailabilityMonitor,
  "availability-gap-filler": runAvailabilityGapFiller,
  "booking-conflict-monitor": runBookingConflictMonitor,
  "ai-code-reviewer": runAiCodeReviewer,
  "demand-predictor": runDemandPredictor,
  "24-7-booking-alerts": runProactiveBookingAlerts,
  "plan-effectiveness-agent": runPlanEffectivenessAgent,
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  // Verifiser cron-secret
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { agent } = await params;
  const fn = AGENTS[agent];
  if (!fn) {
    return NextResponse.json({ error: "unknown-agent" }, { status: 404 });
  }

  try {
    const result = await fn();
    return NextResponse.json({ ok: true, agent, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "agent-failed" },
      { status: 500 }
    );
  }
}
