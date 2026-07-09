/**
 * v2-forhåndsvisning — PlayerHQ Mål-hub (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), MalHubV2 rendrer innholds-stacken.
 *
 * Auth + dataloader + fremdrifts-/status-mapping gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/mal/page.tsx): samme Prisma-queries (aktive Goal + siste
 * Achievement), samme beregnFremdrift/mapGoalRow-logikk, samme milepæl-titler.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MalHubV2, type MalHubData, type MalGoalStatus, type MalGoalRad } from "@/components/portal/v2/MalHubV2";
import type { Goal } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

// ── Mapping (speil av ekte side) ─────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP",
  ROUNDS_PER_MONTH: "RUNDER",
  SG_AREA: "SG",
  FREE_TEXT: "MÅL",
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? "MÅL";
}

function formatKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

function beregnFremdrift(goal: Goal, hcp: number | null): { pct: number; status: MalGoalStatus; sub: string } {
  const { type, targetValue, targetDate } = goal;

  // HCP-mål: reise fra 54 → målverdi
  if (type === "HCP_TARGET" && targetValue !== null && hcp !== null) {
    const start = 54;
    const range = Math.max(0.1, start - targetValue);
    const reise = Math.max(0, start - hcp);
    const pct = Math.min(100, Math.round((reise / range) * 100));
    const fristStr = targetDate ? `Frist: ${formatKortDato(targetDate)}` : "Ingen frist";
    const delta = +(hcp - targetValue).toFixed(1);
    const sub =
      delta > 0
        ? `${hcp.toFixed(1)} nå · trenger ${delta.toFixed(1)} til · ${fristStr}`
        : `Mål nådd! HCP ${hcp.toFixed(1)}`;
    const status: MalGoalStatus = pct >= 100 ? "achieved" : pct >= 50 ? "on-track" : "behind";
    return { pct, status, sub };
  }

  // Fallback — ingen kalkulerbar fremdrift
  const sub = targetDate ? `Frist: ${formatKortDato(targetDate)}` : goal.title;
  return { pct: 0, status: "on-track", sub };
}

function mapGoalRow(goal: Goal, hcp: number | null): MalGoalRad {
  const { pct, status, sub } = beregnFremdrift(goal, hcp);
  const STATUS_LABELS: Record<MalGoalStatus, string> = {
    "on-track": pct >= 80 ? "Nær mål" : "På sporet",
    behind: "Bak plan",
    achieved: "Oppnådd",
  };
  return { id: goal.id, type: typeLabel(goal.type), title: goal.title, pct, sub, status, statusLabel: STATUS_LABELS[status] };
}

const ACHIEVEMENT_TITLER: Record<string, string> = {
  STREAK_7: "7 dager på rad",
  STREAK_14: "14 dager på rad",
  STREAK_30: "30 dager på rad",
  FIRST_ROUND: "Første registrerte runde",
  FIRST_TEST: "Første gjennomførte test",
  SG_POSITIVE_30D: "SG positiv siste 30 dager",
  HCP_DOWN: "HCP gikk ned",
  ROUND_BEST: "Ny personlig rekord",
};

// ── Side ─────────────────────────────────────────────────────────────

export default async function V2MalPreviewPage() {
  const user = await requirePortalUser();

  const [goals, sisteMilepael] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.achievement.findFirst({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const data: MalHubData = {
    antall: goals.length,
    goals: goals.map((g) => mapGoalRow(g, user.hcp)),
    milepael: sisteMilepael
      ? {
          tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
          dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
        }
      : null,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? undefined}>
      <MalHubV2 data={data} />
    </V2Shell>
  );
}
