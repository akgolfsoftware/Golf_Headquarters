/**
 * Bølge 5 — treningsanalyse: planlagt vs gjennomført + repstype-fordeling.
 * Aggregerer TrainingDrillV2 (plan) + DrillLogV2 (faktisk) for én spiller.
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea, RepType } from "@/generated/prisma/client";
import { z } from "zod";

const InputSchema = z.object({
  userId: z.string().min(1),
  fra: z.coerce.date(),
  til: z.coerce.date(),
});

export type TreningsanalyseKpi = {
  planlagteOkter: number;
  gjennomforteOkter: number;
  etterlevelsePct: number | null;
  planlagteReps: number;
  faktiskeReps: number;
  ballerSlatt: number;
  svingerUtenBall: number;
  tidMinutter: number;
  settReps: number;
  perAkse: Array<{
    axis: PyramidArea;
    planlagtMin: number;
    faktiskReps: number;
    okter: number;
  }>;
  perRepType: Array<{
    type: RepType | "UKJENT";
    planlagt: number;
    faktisk: number;
  }>;
};

const TOM_AKSE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export async function hentTreningsanalyse(input: {
  userId: string;
  fra: Date;
  til: Date;
}): Promise<TreningsanalyseKpi> {
  const { userId, fra, til } = InputSchema.parse(input);

  const sessions = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: userId,
      startTime: { gte: fra, lte: til },
    },
    select: {
      id: true,
      status: true,
      startTime: true,
      endTime: true,
      drills: {
        select: {
          id: true,
          pyramide: true,
          durationMinutes: true,
          repetitions: true,
          repType: true,
          repAntall: true,
        },
      },
    },
  });

  const drillIds = sessions.flatMap((s) => s.drills.map((d) => d.id));
  const logs =
    drillIds.length > 0
      ? await prisma.drillLogV2.findMany({
          where: { drillId: { in: drillIds }, loggedBy: userId },
          select: {
            drillId: true,
            repsTotal: true,
            repsWithoutBall: true,
            repsHit: true,
          },
        })
      : [];

  const logByDrill = new Map(logs.map((l) => [l.drillId, l]));

  let planlagteReps = 0;
  let faktiskeReps = 0;
  let ballerSlatt = 0;
  let svingerUtenBall = 0;
  let tidMinutter = 0;
  let settReps = 0;

  const akseMap = new Map<PyramidArea, { planlagtMin: number; faktiskReps: number; okter: Set<string> }>();
  for (const a of TOM_AKSE) {
    akseMap.set(a, { planlagtMin: 0, faktiskReps: 0, okter: new Set() });
  }

  const repTypeMap = new Map<RepType | "UKJENT", { planlagt: number; faktisk: number }>();

  for (const s of sessions) {
    for (const d of s.drills) {
      const plan = d.repetitions ?? d.repAntall ?? 0;
      planlagteReps += plan;
      const log = logByDrill.get(d.id);
      const faktisk = log?.repsTotal ?? 0;
      faktiskeReps += faktisk;
      ballerSlatt += log?.repsHit ?? 0;
      svingerUtenBall += log?.repsWithoutBall ?? 0;

      const akse = akseMap.get(d.pyramide)!;
      akse.planlagtMin += d.durationMinutes;
      akse.faktiskReps += faktisk;
      akse.okter.add(s.id);

      const rt: RepType | "UKJENT" = d.repType ?? "UKJENT";
      if (rt === "TID") tidMinutter += d.durationMinutes;
      if (rt === "SETT_REPS") settReps += plan;
      const bucket = repTypeMap.get(rt) ?? { planlagt: 0, faktisk: 0 };
      bucket.planlagt += plan;
      bucket.faktisk += faktisk;
      repTypeMap.set(rt, bucket);
    }
  }

  const gjennomforteOkter = sessions.filter((s) => s.status === "COMPLETED").length;
  const planlagteOkter = sessions.length;
  const etterlevelsePct =
    planlagteOkter > 0 ? Math.round((gjennomforteOkter / planlagteOkter) * 100) : null;

  return {
    planlagteOkter,
    gjennomforteOkter,
    etterlevelsePct,
    planlagteReps,
    faktiskeReps,
    ballerSlatt,
    svingerUtenBall,
    tidMinutter,
    settReps,
    perAkse: TOM_AKSE.map((axis) => {
      const v = akseMap.get(axis)!;
      return {
        axis,
        planlagtMin: v.planlagtMin,
        faktiskReps: v.faktiskReps,
        okter: v.okter.size,
      };
    }),
    perRepType: Array.from(repTypeMap.entries()).map(([type, v]) => ({
      type,
      planlagt: v.planlagt,
      faktisk: v.faktisk,
    })),
  };
}
