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
import { TilbakeLenke } from "@/components/v2";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";

export const dynamic = "force-dynamic";

// ── Mapping ────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP",
  ROUNDS_PER_MONTH: "RUNDER",
  SG_AREA: "SG",
  SESSION_FREQUENCY: "ØKTER",
  TEST_SCORE: "TEST",
  FREE_TEXT: "MÅL",
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? "MÅL";
}

function formatKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABELS: Record<MalGoalStatus, string> = {
  "on-track": "På sporet",
  behind: "Bak plan",
  achieved: "Oppnådd",
  "no-data": "Ingen data ennå",
};

async function mapGoalRow(goal: Goal, hcp: number | null): Promise<MalGoalRad> {
  const progress = await beregnGoalProgress(goal, { hcp });
  const fristStr = goal.targetDate ? `Frist: ${formatKortDato(goal.targetDate)}` : "Ingen frist";
  const statusLabel =
    progress.status === "on-track" && progress.pct >= 80 ? "Nær mål" : STATUS_LABELS[progress.status];
  return {
    id: goal.id,
    type: typeLabel(goal.type),
    title: goal.title,
    pct: progress.pct,
    sub: progress.hasData ? `${progress.detail} · ${fristStr}` : fristStr,
    status: progress.status,
    statusLabel,
    hasData: progress.hasData,
  };
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
    goals: await Promise.all(goals.map((g) => mapGoalRow(g, user.hcp))),
    milepael: sisteMilepael
      ? {
          tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
          dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
        }
      : null,
  };

  return (
    <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? undefined}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <MalHubV2 data={data} />
    </V2Shell>
  );
}
