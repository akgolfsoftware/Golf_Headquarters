"use server";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadSession } from "./wb-actions";

/** Read the same canonical session as the calendar, including custom drills. */
export async function hentOktInspektor(sessionId: string) {
  await requirePortalUser();
  const tilgang = await loadSession(sessionId);
  if (!tilgang.ok || !tilgang.data) return { ok: false as const };
  const okt = await prisma.workbenchSession.findUnique({
    where: { id: sessionId, playerId: tilgang.data.playerId },
    select: {
      lFase: true, miljo: true,
      drills: {
        orderBy: { sortOrder: "asc" },
        select: { title: true, durationMinutes: true, repMinutter: true, repSett: true, repReps: true, repType: true },
      },
    },
  });
  if (!okt) return { ok: false as const };
  return {
    ok: true as const,
    lFase: okt.lFase,
    miljo: okt.miljo,
    drills: okt.drills.map(d => ({
      navn: d.title,
      minutter: d.repMinutter ?? d.durationMinutes,
      sett: d.repSett,
      reps: d.repReps,
      nivaa: d.repType === "SVINGER_UTEN_BALL" ? "uten" : "vanlig",
    })),
  };
}
