/**
 * AgenticOS-hub — /admin/agenticos.
 *
 * Ny samleflate (Anders 2026-08-04, `.claude/rules/beslutninger.md`
 * §«AI-laget samles på ÉN adresse») som erstatter spredningen over
 * /admin/agents, /admin/agent-team og AI-panelet på konsollen — begge de
 * gamle adressene er nå redirects hit (se de to page.tsx-filene).
 *
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-agenticos-hub.html.
 *
 * Data fra AGENT_INFO/MANUELLE_AGENTER (`src/lib/agencyos/agent-registry.ts`,
 * flyttet ut av /admin/agents da den siden ble en redirect), per-agent-
 * statistikk fra groupBy over siste 30 dager (H6 — de siste 30 kjøringene
 * globalt dekket ikke hele flåten), siste 30 AgentRun som kjøringsliste,
 * PlanAction-tellinger,
 * og ai_costs-aggregater (datamodell vedtatt 13.08 — agenter logger via
 * `registrerAiKost`). Ingen kostdata → ekte tom-tilstand, aldri fabrikkerte tall.
 *
 * Server component.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AGENT_INFO, MANUELLE_AGENTER, kanoniskSlug } from "@/lib/agencyos/agent-registry";
import {
  AdminAgenticosHubV2,
  type AgenticosHubData,
  type AgenticosAgentRow,
  type AgenticosRun,
  type AgentStatusKey,
} from "@/components/admin/v2/AdminAgenticosHubV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "AgenticOS · AgencyOS" };

/** Ruter som hører til drift men lever på egne adresser (fasitens «Verktøy og rom»). */
const ROM: { navn: string; href: string; meta: string }[] = [
  { navn: "Godkjenninger", href: "/admin/godkjenninger", meta: "Agent-forslag som venter på deg" },
  { navn: "Daglig brief", href: "/admin/brief", meta: "Morgenbrief per coach og hastefunn" },
  { navn: "Opptak", href: "/admin/recording", meta: "Transkriberer → analyserer → foreslår" },
  { navn: "Workspace", href: "/admin/workspace", meta: "Oppgaver og prosjekter (Notion-synk)" },
  { navn: "Marketing", href: "/admin/marketing", meta: "Kampanjer og innhold" },
  { navn: "Rapporter", href: "/admin/reports", meta: "Rapporter og eksport" },
];

export default async function AdminAgenticosPage() {
  // G6: USE_AGENTS er BEVISST utenfor COACH-defaulten — AI-laget grantes
  // per trener av Anders. ADMIN har alt.
  const user = await requireCapability(Capability.USE_AGENTS);

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);
  const sju_dager_siden = new Date();
  sju_dager_siden.setDate(sju_dager_siden.getDate() - 7);
  const tretti_dager_siden = new Date();
  tretti_dager_siden.setDate(tretti_dager_siden.getDate() - 30);

  const [recentRuns, runGrupper30d, pendingCount, forslagIdag, kjoringerIdag, kjoringerIdagFeil, signaler7d, planForslag7d, kostIdag, kost7d, kallUtenPris7d] =
    await Promise.all([
      prisma.agentRun.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
      // Per-agent-statistikk: groupBy over siste 30 DAGER — de siste 30
      // kjøringene globalt (recentRuns) dekker bare en brøkdel av flåten
      // nå som registeret er komplett (H6).
      prisma.agentRun.groupBy({
        by: ["agentName", "status"],
        where: { createdAt: { gte: tretti_dager_siden } },
        _count: { _all: true },
        _sum: { duration: true },
      }),
      prisma.planAction.count({ where: { status: "PENDING" } }),
      prisma.planAction.count({ where: { createdAt: { gte: idag } } }),
      prisma.agentRun.count({ where: { createdAt: { gte: idag } } }),
      prisma.agentRun.count({ where: { createdAt: { gte: idag }, status: "ERROR" } }),
      prisma.signal.count({ where: { computedAt: { gte: sju_dager_siden } } }),
      prisma.planAction.count({ where: { createdAt: { gte: sju_dager_siden } } }),
      prisma.aiCost.aggregate({
        where: { createdAt: { gte: idag } },
        _count: { _all: true },
        _sum: { costUsd: true },
      }),
      prisma.aiCost.aggregate({
        where: { createdAt: { gte: sju_dager_siden } },
        _count: { _all: true },
        _sum: { costUsd: true },
      }),
      prisma.aiCost.count({ where: { createdAt: { gte: sju_dager_siden }, costUsd: null } }),
    ]);

  // Aggreger per agent fra groupBy-vinduet (siste 30 dager). Aliaser
  // (purring/bekreftet-kjøringer fra samme fil) telles inn under
  // hovedagentens slug via kanoniskSlug.
  const perAgent = new Map<string, { ok: number; error: number; totalDuration: number }>();
  for (const g of runGrupper30d) {
    const slug = kanoniskSlug(g.agentName);
    const eks = perAgent.get(slug) ?? { ok: 0, error: 0, totalDuration: 0 };
    if (g.status === "OK") eks.ok += g._count._all;
    else eks.error += g._count._all;
    eks.totalDuration += g._sum.duration ?? 0;
    perAgent.set(slug, eks);
  }

  const agenter: AgenticosAgentRow[] = Object.entries(AGENT_INFO).map(([slug, info]) => {
    const stats = perAgent.get(slug);
    const kjoringer = stats ? stats.ok + stats.error : 0;
    const erManuellTrigger = info.trigger.toLowerCase().startsWith("manuell");
    const status: AgentStatusKey = !stats
      ? erManuellTrigger
        ? "manuell"
        : "ingen-data"
      : stats.error > 0
        ? "feil"
        : "aktiv";
    return {
      slug,
      navn: info.navn,
      trigger: info.trigger,
      status,
      kjoringer30d: kjoringer,
      snittTidMs: stats ? Math.round(stats.totalDuration / Math.max(kjoringer, 1)) : null,
      detaljHref: `/admin/agents/${slug}`,
    };
  });

  const feilendeAgenter = agenter
    .filter((a) => a.status === "feil")
    .map((a) => ({ navn: a.navn, detaljHref: a.detaljHref }));

  const runs: AgenticosRun[] = recentRuns.map((r) => ({
    id: r.id,
    agentNavn: AGENT_INFO[kanoniskSlug(r.agentName)]?.navn ?? r.agentName,
    ok: r.status === "OK",
    durationMs: r.duration,
    naar: r.createdAt.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const kjoringerOk = recentRuns.filter((r) => r.status === "OK").length;
  const kjoringerFeil = recentRuns.length - kjoringerOk;
  const snittTidMs =
    recentRuns.length > 0
      ? Math.round(recentRuns.reduce((sum, r) => sum + r.duration, 0) / recentRuns.length)
      : null;

  const data: AgenticosHubData = {
    kpi: {
      registrerteAgenter: Object.keys(AGENT_INFO).length,
      kjorbareManuelt: MANUELLE_AGENTER.length,
      kjoringerSiste30: recentRuns.length,
      kjoringerOk,
      kjoringerFeil,
      forslagIdag,
      ventendeGodkjenning: pendingCount,
    },
    agenter,
    runs,
    feilendeAgenter,
    rom: ROM,
    panel: {
      kjoringerIdag,
      kjoringerIdagFeil,
      feilrateTeller: kjoringerFeil,
      feilrateNevner: recentRuns.length,
      snittTidMs,
      signaler7d,
      planForslag7d,
    },
    aiKost: {
      kallIdag: kostIdag._count._all,
      kostIdagUsd: kostIdag._sum.costUsd,
      kall7d: kost7d._count._all,
      kost7dUsd: kost7d._sum.costUsd,
      kallUtenPris7d,
    },
    godkjenningerHref: "/admin/godkjenninger",
  };

  return (
    <V2Shell bredde="full" aktiv="agenticos" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <AdminAgenticosHubV2 data={data} />
    </V2Shell>
  );
}
