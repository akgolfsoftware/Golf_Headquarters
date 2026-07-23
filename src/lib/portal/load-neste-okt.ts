import "server-only";

/**
 * Summary-kjeding (flytpakke 2, punkt 2.7): finner spillerens neste
 * planlagte økt på tvers av begge øktspor (TrainingSessionV2 og
 * TrainingPlanSession — Spor A/B, se v2-format.ts og session-hrefs.ts).
 * Ren datahenting; tekstformattering skjer i neste-okt-tekst.ts.
 *
 * Spiller ser ikke økter knyttet til DRAFT/REJECTED-planer (matcher workbench).
 */

import { prisma } from "@/lib/prisma";
import { planSessionStartHref, v2DbSessionHref } from "@/lib/portal/session-hrefs";
import type { NesteOktInput } from "@/lib/portal/neste-okt-tekst";

const PLAYER_VISIBLE_PLAN = ["PENDING_PLAYER", "ACCEPTED", "ACTIVE", "PAUSED"] as const;

export async function loadNesteOkt(
  userId: string,
  etter: Date,
): Promise<{ okt: NesteOktInput; href: string }> {
  const [v2Candidates, v1] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { studentId: userId, startTime: { gt: etter }, status: "PLANNED" },
      orderBy: { startTime: "asc" },
      take: 12,
      select: {
        id: true,
        title: true,
        startTime: true,
        status: true,
        generertFraId: true,
      },
    }),
    prisma.trainingPlanSession.findFirst({
      where: {
        plan: {
          userId,
          status: { in: [...PLAYER_VISIBLE_PLAN] },
        },
        scheduledAt: { gt: etter },
        status: "PLANNED",
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, status: true },
    }),
  ]);

  // Skjul V2 som speiler utkast-planer (DRAFT/REJECTED).
  const linkedIds = v2Candidates
    .map((v) => v.generertFraId)
    .filter((id): id is string => id != null);
  const skjulte =
    linkedIds.length === 0
      ? []
      : await prisma.trainingPlanSession.findMany({
          where: {
            id: { in: linkedIds },
            plan: { status: { in: ["DRAFT", "REJECTED"] } },
          },
          select: { id: true },
        });
  const skjulteSet = new Set(skjulte.map((s) => s.id));
  const v2 = v2Candidates.find(
    (v) => !(v.generertFraId && skjulteSet.has(v.generertFraId)),
  );

  const kandidater = [
    v2 && {
      tittel: v2.title,
      startTime: v2.startTime,
      href: v2DbSessionHref(v2.id, v2.status),
    },
    v1 && {
      tittel: v1.title,
      startTime: v1.scheduledAt,
      href: planSessionStartHref(v1.id, v1.status),
    },
  ].filter((x): x is { tittel: string; startTime: Date; href: string } => x != null);

  const neste = kandidater.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];

  if (!neste) return { okt: null, href: "/portal/planlegge/workbench" };
  return { okt: { tittel: neste.tittel, startTime: neste.startTime }, href: neste.href };
}
