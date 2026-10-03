/**
 * PH19Mal — mål-huben i PlayerHQSkall.
 * Samme mål, fremdrift og siste milepæl.
 */

import Link from "next/link";
import { harEgenIupInngang } from "@/lib/iup/oversikt";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { MalHubV2, type MalHubData, type MalGoalStatus, type MalGoalRad } from "@/components/portal/v2/MalHubV2";
import type { Goal } from "@/generated/prisma/client";
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
    category: goal.category,
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

  const [goals, sisteMilepael, visIup] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.achievement.findFirst({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
    ["PLAYER", "COACH", "ADMIN"].includes(user.role) ? harEgenIupInngang() : Promise.resolve(false),
  ]);

  const data: MalHubData = {
    antall: goals.length,
    antallResultat: goals.filter((goal) => goal.category === "OUTCOME").length,
    antallProsess: goals.filter((goal) => goal.category === "PROCESS").length,
    goals: await Promise.all(goals.map((g) => mapGoalRow(g, user.hcp))),
    milepael: sisteMilepael
      ? {
          tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
          dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }),
        }
      : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
        <MalHubV2 data={data} />
        {visIup && <Link href="/portal/mal/evaluering" className="ph-tilbake">Utviklingssjekk og sesongevaluering</Link>}
      </div>
    </PlayerHQSkall>
  );
}
