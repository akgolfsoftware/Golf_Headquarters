/**
 * PH19Mal — Målsetninger i PlayerHQSkall (Precision Athletics).
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * «Mål» heter Målsetninger.
 * Talentradar vises aldri for spilleren.
 */

import { harEgenIupInngang } from "@/lib/iup/oversikt";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH19Malsetninger } from "@/components/portal/precision/PH19Malsetninger";
import type { Goal } from "@/generated/prisma/client";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import {
  formatDatoKort,
  hentKildeLabel,
  type PH19Goal,
  type PH19MalData,
} from "@/lib/portal-mal/ph19-mal-data";

export const dynamic = "force-dynamic";

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

const STATUS_LABELS = {
  "on-track": "På sporet",
  behind: "Bak plan",
  achieved: "Oppnådd",
  "no-data": "Ingen data ennå",
};

async function mapTilPH19Goal(goal: Goal, hcp: number | null): Promise<PH19Goal> {
  const progress = await beregnGoalProgress(goal, { hcp });
  const statusLabel =
    progress.status === "on-track" && progress.pct >= 80 ? "Nær mål" : STATUS_LABELS[progress.status];

  return {
    id: goal.id,
    category: goal.category as "OUTCOME" | "PROCESS",
    type: goal.type,
    sentence: goal.title,
    title: goal.title,
    src: hentKildeLabel(goal.type),
    due: goal.targetDate ? formatDatoKort(goal.targetDate) : "Ingen frist",
    now: progress.value ?? (hcp ?? 0),
    unit: goal.type === "HCP_TARGET" ? "HCP" : goal.type === "ROUNDS_PER_MONTH" ? "runder" : "",
    target: goal.targetValue ?? 0,
    pct: progress.pct,
    status: progress.status,
    statusLabel,
    hasData: progress.hasData,
  };
}

export default async function PH19MalPage() {
  const user = await requirePortalUser();

  const [goals, sisteMilepael, visIup, uleste] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.achievement.findFirst({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
    ["PLAYER", "COACH", "ADMIN"].includes(user.role) ? harEgenIupInngang() : Promise.resolve(false),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  const mappedGoals = await Promise.all(goals.map((g) => mapTilPH19Goal(g, user.hcp)));

  const data: PH19MalData = {
    antall: mappedGoals.length,
    antallResultat: mappedGoals.filter((g) => g.category === "OUTCOME").length,
    antallProsess: mappedGoals.filter((g) => g.category === "PROCESS").length,
    goals: mappedGoals,
    milepael: sisteMilepael
      ? {
          tittel: ACHIEVEMENT_TITLER[sisteMilepael.kind] ?? sisteMilepael.kind,
          dato: sisteMilepael.earnedAt.toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }
      : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Malsetninger data={data} visIup={visIup} />
    </PlayerHQSkall>
  );
}
