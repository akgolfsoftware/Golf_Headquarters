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
import { beregnMaalFremdrift } from "@/lib/domain/maal-fremdrift";
import { startOfMonth } from "@/lib/uke-helpers";

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

type FremdriftKtx = { hcp: number | null; runderDenneMnd: number };

function beregnFremdrift(goal: Goal, ktx: FremdriftKtx): { pct: number; status: MalGoalStatus; sub: string } {
  const { pct, status, kilde } = beregnMaalFremdrift(goal, {
    hcp: ktx.hcp,
    runderDenneMnd: ktx.runderDenneMnd,
  });
  const fristStr = goal.targetDate ? `Frist: ${formatKortDato(goal.targetDate)}` : "Ingen frist";

  let sub: string;
  if (kilde === "hcp" && goal.targetValue !== null && ktx.hcp !== null) {
    const delta = +(ktx.hcp - goal.targetValue).toFixed(1);
    sub =
      delta > 0
        ? `${ktx.hcp.toFixed(1)} nå · trenger ${delta.toFixed(1)} til · ${fristStr}`
        : `Mål nådd! HCP ${ktx.hcp.toFixed(1)}`;
  } else if (kilde === "runder" && goal.targetValue !== null) {
    sub = `${ktx.runderDenneMnd} av ${goal.targetValue} runder denne måneden`;
  } else {
    sub = goal.targetDate ? fristStr : goal.title;
  }
  return { pct, status, sub };
}

function mapGoalRow(goal: Goal, ktx: FremdriftKtx): MalGoalRad {
  const { pct, status, sub } = beregnFremdrift(goal, ktx);
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

  const [goals, sisteMilepael, runderDenneMnd] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.achievement.findFirst({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.round.count({
      where: { userId: user.id, playedAt: { gte: startOfMonth(new Date()) } },
    }),
  ]);

  const ktx: FremdriftKtx = { hcp: user.hcp, runderDenneMnd };

  const data: MalHubData = {
    antall: goals.length,
    goals: goals.map((g) => mapGoalRow(g, ktx)),
    milepael: sisteMilepael
      ? {
          tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
          dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
        }
      : null,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? undefined}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <MalHubV2 data={data} />
    </V2Shell>
  );
}
