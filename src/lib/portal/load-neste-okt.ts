import "server-only";

/**
 * Summary-kjeding (flytpakke 2, punkt 2.7): finner spillerens neste
 * planlagte økt på tvers av begge øktspor (TrainingSessionV2 og
 * TrainingPlanSession — Spor A/B, se v2-format.ts og session-hrefs.ts).
 * Ren datahenting; tekstformattering skjer i neste-okt-tekst.ts.
 */

import { prisma } from "@/lib/prisma";
import { planSessionStartHref, v2DbSessionHref } from "@/lib/portal/session-hrefs";
import type { NesteOktInput } from "@/lib/portal/neste-okt-tekst";

export async function loadNesteOkt(
  userId: string,
  etter: Date,
): Promise<{ okt: NesteOktInput; href: string }> {
  const [v2, v1] = await Promise.all([
    prisma.trainingSessionV2.findFirst({
      where: { studentId: userId, startTime: { gt: etter }, status: "PLANNED" },
      orderBy: { startTime: "asc" },
      select: { id: true, title: true, startTime: true, status: true },
    }),
    prisma.trainingPlanSession.findFirst({
      where: {
        plan: {
          userId,
          // Match spiller-workbench: skjul DRAFT/REJECTED
          status: { in: ["PENDING_PLAYER", "ACCEPTED", "ACTIVE", "PAUSED"] },
        },
        scheduledAt: { gt: etter },
        status: "PLANNED",
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, status: true },
    }),
  ]);

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
