// Cron-endpoint for agenter. Beskyttes via CRON_SECRET-header (Vercel Cron
// sender automatisk Authorization: Bearer <CRON_SECRET>).

import { NextResponse } from "next/server";
import { runPlanWatcher } from "@/lib/agents/plan-watcher";
import { runBookingReminders } from "@/lib/agents/booking-reminders";
import { runCleanupRecordings } from "@/lib/agents/cleanup-recordings";
import { runSgInsights } from "@/lib/sg-hub/insight-engine";
import { syncDataGolf } from "@/lib/sg-hub/datagolf-sync";
import { runClubTrends } from "@/lib/sg-hub/club-trend-aggregator";

export const runtime = "nodejs";
export const maxDuration = 300;

const AGENTS: Record<string, () => Promise<unknown>> = {
  "plan-watcher": runPlanWatcher,
  "booking-reminders": runBookingReminders,
  "cleanup-recordings": runCleanupRecordings,
  "sg-insights": runSgInsights,
  "datagolf-sync": syncDataGolf,
  "club-trends": runClubTrends,
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
