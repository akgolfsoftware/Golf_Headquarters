/**
 * v2-preview: AgencyOS Agenter (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/agents-flaten: samme requirePortalUser-guard
 * og samme Prisma-loader (Signal/PlanAction-tellinger + siste 30 AgentRun).
 * Mapper til AdminAgenterV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminAgenterV2,
  type AdminAgenterV2Data,
  type AdminAgentV2Row,
  type AdminAgentV2Run,
  type AgentStatusKey,
} from "@/components/admin/v2/AdminAgenterV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenter · AgencyOS (v2)" };

// Manuelt kjørbare agenter (speil av MANUELT-nøklene i
// src/app/admin/agents/actions.ts — kan ikke importeres direkte fordi
// "use server"-filer kun kan eksportere async funksjoner, ikke konstanter).
const MANUELLE_AGENTER = [
  "plan-watcher",
  "training-gap",
  "daily-brief",
  "drill-forslag",
  "booking-optimizer",
  "availability-24-7-monitor",
  "availability-gap-filler",
  "booking-conflict-monitor",
  "ai-code-reviewer",
  "demand-predictor",
  "24-7-booking-alerts",
];

// Registrerte agenter (speil av AGENT_INFO i src/app/admin/agents/page.tsx).
const AGENT_INFO: Record<string, { navn: string; trigger: string; beskrivelse: string }> = {
  "round-agent": {
    navn: "Round Agent",
    trigger: "Etter ny runde",
    beskrivelse: "Beregner SG-snitt siste 30 dager og skriver til Signal.",
  },
  "test-agent": {
    navn: "Test Agent",
    trigger: "Etter ny test",
    beskrivelse: "Trend-analyse per test (siste vs snitt forrige 3).",
  },
  "trackman-agent": {
    navn: "TrackMan Agent",
    trigger: "Etter CSV-import",
    beskrivelse: "Per-kølle-statistikk fra rawJson.",
  },
  "plan-watcher": {
    navn: "Plan Watcher",
    trigger: "Cron mandag 06:00",
    beskrivelse: "Sjekker forrige uke, genererer PYRAMID_ADJUST-forslag ved avvik.",
  },
  periodiseringsagent: {
    navn: "Periodiseringsagent",
    trigger: "Ved ny TrainingPlan",
    beskrivelse: "Foreslår initial uke-allokering for nye planer.",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    trigger: "Etter round/test",
    beskrivelse: "Sjekker streak/SG/first-time-milepæler.",
  },
  "training-gap": {
    navn: "Training Gap",
    trigger: "Cron mandag 06:30",
    beskrivelse: "Finner svakeste SG-område og genererer TRAINING_GAP-forslag hvis det får < 20 % av treningstid.",
  },
  "turnering-agent": {
    navn: "Turnering-agent",
    trigger: "Cron daglig 07:00",
    beskrivelse: "Spillere med turnering innen 7 dager får PERIOD_SWITCH-forslag.",
  },
  "calendar-sync": {
    navn: "Calendar Sync",
    trigger: "Cron hvert 15. min",
    beskrivelse: "2-veis synkronisering med Google Calendar: henter endringer (pull) og pusher bookinger uten event-ID (repair).",
  },
  "daily-brief": {
    navn: "Daily Brief",
    trigger: "Cron daglig 05:30",
    beskrivelse: "Genererer morgenbrief per coach (økter, flagg, neste turnering). Varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
  },
  "drill-forslag": {
    navn: "Drill-forslag",
    trigger: "Cron mandag 08:00",
    beskrivelse: "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (med YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
  },
  "plan-revisjon": {
    navn: "Plan-revisjon",
    trigger: "Manuell (velg plan)",
    beskrivelse: "Foreslår konkrete plan-justeringer for en valgt treningsplan og trigger (siste runde / skade / turneringsprep). Kjøres fra agent-detaljene.",
  },
  peaking: {
    navn: "Peaking",
    trigger: "Manuell (velg spiller)",
    beskrivelse: "Foreslår uke-for-uke periodisering (Bompa) frem mot en valgt turnering for en spiller. Kjøres fra agent-detaljene.",
  },
};

export default async function V2AdminAgenterPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const [signalsCount, planActionsCount, recentRuns, pendingCount, forslagIdag] =
    await Promise.all([
      prisma.signal.count(),
      prisma.planAction.count(),
      prisma.agentRun.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.planAction.count({ where: { status: "PENDING" } }),
      prisma.planAction.count({ where: { createdAt: { gte: idag } } }),
    ]);

  // Aggreger per agent (fra siste 30 kjøringer).
  const perAgent = new Map<string, { ok: number; error: number; totalDuration: number }>();
  for (const r of recentRuns) {
    const eks = perAgent.get(r.agentName) ?? { ok: 0, error: 0, totalDuration: 0 };
    if (r.status === "OK") eks.ok++;
    else eks.error++;
    eks.totalDuration += r.duration;
    perAgent.set(r.agentName, eks);
  }

  const agenter: AdminAgentV2Row[] = Object.entries(AGENT_INFO).map(([slug, info]) => {
    const stats = perAgent.get(slug);
    const kjoringer = stats ? stats.ok + stats.error : 0;
    const status: AgentStatusKey = !stats ? "ingen-data" : stats.error > 0 ? "feil" : "aktiv";
    return {
      slug,
      navn: info.navn,
      trigger: info.trigger,
      beskrivelse: info.beskrivelse,
      status,
      kjoringer,
      snittTidMs: stats ? Math.round(stats.totalDuration / Math.max(kjoringer, 1)) : null,
      detaljHref: `/admin/agents/${slug}`,
    };
  });

  const runs: AdminAgentV2Run[] = recentRuns.map((r) => ({
    id: r.id,
    agentName: r.agentName,
    ok: r.status === "OK",
    durationMs: r.duration,
    naar: r.createdAt.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const manuelleAgenter = MANUELLE_AGENTER.map((slug) => ({
    slug,
    navn: AGENT_INFO[slug]?.navn ?? slug,
  }));

  const data: AdminAgenterV2Data = {
    signalsCount,
    planActionsCount,
    aktiveAgenter: Object.keys(AGENT_INFO).length,
    forslagIdag,
    pendingCount,
    godkjenningerHref: "/admin/godkjenninger",
    agenter,
    runs,
    manuelleAgenter,
    erAdmin: user.role === "ADMIN",
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminAgenterV2 data={data} />
    </V2Shell>
  );
}
