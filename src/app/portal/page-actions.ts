"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type PeriodVolumes = {
  FYS: number;  // antall økter per uke
  TEK: number;
  SLAG: number;
  SPILL: number;
  TURN: number;
};

export type CreateSessionsResult =
  | { ok: true; sessionsCreated: number }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// createSessionsForPeriod
//
// Henter PeriodBlock fra DB, beregner antall uker, og lager TrainingPlanSession
// for hver pyramide-type per uke i perioden.
// Kobler til brukerens aktive plan (oppretter én hvis ingen finnes).
// ---------------------------------------------------------------------------

export async function createSessionsForPeriod(
  periodBlockId: string,
  volumes: PeriodVolumes,
): Promise<CreateSessionsResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ikke innlogget" };

  // Hent PeriodBlock — verifiser at den tilhører brukerens SeasonPlan
  const block = await prisma.periodBlock.findFirst({
    where: {
      id: periodBlockId,
      seasonPlan: { userId: user.id },
    },
  });

  if (!block) {
    return { ok: false, error: "Periodeblokk ikke funnet eller ingen tilgang" };
  }

  // Finn aktiv plan (eller opprett en enkel plan for perioden)
  let plan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) {
    // Opprett en plan koblet til perioden
    plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: `Plan — ${block.lPhase} (auto)`,
        startDate: block.startDate,
        endDate: block.endDate,
        isActive: true,
        status: "ACTIVE",
      },
    });
  }

  const planId = plan.id;

  // Beregn antall hele uker
  const start = new Date(block.startDate);
  const end = new Date(block.endDate);
  const diffMs = end.getTime() - start.getTime();
  const totalWeeks = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));

  // Standard varighet per type (minutter)
  const defaultDuration: Record<keyof PeriodVolumes, number> = {
    FYS: 60,
    TEK: 90,
    SLAG: 60,
    SPILL: 120,
    TURN: 180,
  };

  const areas = (["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).filter(
    (a) => volumes[a] > 0,
  );

  const sessionsToCreate: {
    planId: string;
    scheduledAt: Date;
    durationMin: number;
    title: string;
    pyramidArea: PyramidArea;
    lPhase: "GRUNN" | "SPESIAL" | "TURNERING";
  }[] = [];

  for (let week = 0; week < totalWeeks; week++) {
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + week * 7);

    for (const area of areas) {
      const antall = volumes[area];
      for (let i = 0; i < antall; i++) {
        const sessionDate = new Date(weekStart);
        sessionDate.setDate(sessionDate.getDate() + Math.floor((i / antall) * 7));

        sessionsToCreate.push({
          planId,
          scheduledAt: sessionDate,
          durationMin: defaultDuration[area],
          title: `${area} — uke ${week + 1}`,
          pyramidArea: area as PyramidArea,
          lPhase: block.lPhase,
        });
      }
    }
  }

  if (sessionsToCreate.length === 0) {
    return { ok: false, error: "Ingen volum angitt — velg minst én sesjon per uke" };
  }

  await prisma.trainingPlanSession.createMany({
    data: sessionsToCreate,
  });

  revalidatePath("/portal");
  revalidatePath("/portal/tren/aarsplan");

  return { ok: true, sessionsCreated: sessionsToCreate.length };
}
