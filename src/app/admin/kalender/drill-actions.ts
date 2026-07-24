"use server";

/**
 * AgencyOS kalender — lesevisning av drills for en treningsøkt (Bølge 5).
 * Ren lesing; redigering skjer i Workbench.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const Schema = z.object({
  sessionId: z.string().min(1),
});

export type KalenderDrillRad = {
  id: string;
  name: string;
  pyramide: string;
  durationMinutes: number;
  repType: string | null;
  plannedReps: number;
  faktiskeReps: number | null;
};

export async function hentKalenderDrills(
  sessionId: string,
): Promise<{ ok: true; title: string; drills: KalenderDrillRad[] } | { ok: false }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = Schema.safeParse({ sessionId });
  if (!parsed.success) return { ok: false };

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      drills: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          pyramide: true,
          durationMinutes: true,
          repType: true,
          repetitions: true,
          repAntall: true,
          logs: {
            select: { repsTotal: true },
            take: 1,
            orderBy: { loggedAt: "desc" },
          },
        },
      },
    },
  });
  if (!session) return { ok: false };

  return {
    ok: true,
    title: session.title,
    drills: session.drills.map((d) => ({
      id: d.id,
      name: d.name,
      pyramide: d.pyramide,
      durationMinutes: d.durationMinutes,
      repType: d.repType,
      plannedReps: d.repetitions ?? d.repAntall ?? 0,
      faktiskeReps: d.logs[0]?.repsTotal ?? null,
    })),
  };
}
