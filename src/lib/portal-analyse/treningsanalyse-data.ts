/**
 * Bølge 5 — treningsanalyse: planlagt vs gjennomført + repstype-fordeling.
 * Aggregerer TrainingDrillV2 (plan) + DrillLogV2 (faktisk) for én spiller.
 */

import { hentEtterlevelse } from "@/lib/portal/etterlevelse-data";
import { readDrillResults, golfResultCount } from "@/lib/portal-live/training-result";
import { wbDrillPlan } from "@/lib/portal-live/wb-live-map";
import { prisma } from "@/lib/prisma";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
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
  now?: Date;
}): Promise<TreningsanalyseKpi> {
  const { userId, fra, til } = InputSchema.parse(input);

  const visibleSessions = await loadVisibleSessionRange(userId, fra.toISOString(), til.toISOString());
  const v2Ids = visibleSessions.filter(session => session.model === "v2").map(session => session.id);
  const wbIds = visibleSessions.filter(session => session.model === "wb").map(session => session.id);
  const [sessions, workbench, ballCounts] = await Promise.all([
    v2Ids.length === 0
      ? []
      : prisma.trainingSessionV2.findMany({
          where: { id: { in: v2Ids } },
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
        }),
    wbIds.length === 0
      ? []
      : prisma.workbenchSession.findMany({
          where: { id: { in: wbIds } },
          select: {
            id: true,
            liveSnapshot: true,
            pyramid: true,
            drills: {
              select: {
                id: true, title: true, description: true, durationMinutes: true, sortOrder: true, akFormel: true,
                repType: true,
                repAntall: true,
                repMinutter: true,
                repSett: true,
                repReps: true,
              },
            },
          },
        }),
    wbIds.length === 0
      ? []
      : prisma.sessionBallLog.groupBy({
          by: ["planSessionId"],
          where: { planSessionId: { in: wbIds } },
          _sum: { count: true },
        }),
  ]);

  const drillIds = sessions.flatMap((s) => s.drills.map((d) => d.id));
  const logs =
    drillIds.length > 0
      ? await prisma.drillLogV2.findMany({
          where: { drillId: { in: drillIds }, loggedBy: userId },
          select: {
            drillId: true,
            repsTotal: true,
            repsWithoutBall: true, repsLowSpeed: true, repsAutomatic: true,
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
      const plan = d.pyramide === "FYS" || d.repType === "TID" || d.repType === "SETT_REPS" ? 0 : d.repetitions ?? d.repAntall ?? 0;
      planlagteReps += plan;
      const log = logByDrill.get(d.id);
      const faktisk = d.pyramide === "FYS" ? 0 : log?.repsTotal ?? 0;
      faktiskeReps += faktisk;
      ballerSlatt += d.pyramide === "FYS" ? 0 : (log?.repsLowSpeed ?? 0) + (log?.repsAutomatic ?? 0) + (log?.repsHit ?? 0);
      svingerUtenBall += d.pyramide === "FYS" ? 0 : log?.repsWithoutBall ?? 0;

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

  // Workbench-volum er validert i egne felt. Slagtelleren er lagret per økt,
  // ikke per øvelse, så faktiske baller kan knyttes til aksen, men ikke
  // fordeles på øvelser uten å gjette.
  for (const session of visibleSessions.filter(item => item.model !== "v2" && !workbench.some(w => w.id === item.id && w.drills.length > 0))) {
    const axis = akseMap.get(session.pyramidArea)!;
    axis.planlagtMin += session.durationMin;
    axis.okter.add(session.id);
  }
  for (const session of workbench) {
    for (const drill of session.drills) {
      const plan = wbDrillPlan(drill, session.pyramid as PyramidArea);
      const type: RepType | "UKJENT" = drill.repType === "BALLER_SLATT" || drill.repType === "SVINGER_UTEN_BALL" || drill.repType === "SETT_REPS" || drill.repType === "TID" ? drill.repType : "UKJENT";
      const axis = akseMap.get(plan.pyramide)!;
      axis.planlagtMin += drill.durationMinutes;
      axis.okter.add(session.id);
      const planned = plan.plannedReps;
      planlagteReps += planned;
      if (plan.dose?.enhet === "MINUTTER") tidMinutter += plan.dose.antall ?? 0;
      else if (type === "TID") tidMinutter += drill.repMinutter ?? 0;
      if (plan.pyramide === "FYS" && plan.dose?.enhet === "SERIER") settReps += (plan.dose.antall ?? 0) * (plan.dose.reps ?? 0);

      const bucket = repTypeMap.get(type) ?? { planlagt: 0, faktisk: 0 };
      bucket.planlagt += planned;
      repTypeMap.set(type, bucket);
    }
  }
  const detailedGolfSessions = new Set<string>();
  for (const session of workbench) {
    const results = readDrillResults(session.liveSnapshot);
    if (results.some(r => r.result.type === "golf")) detailedGolfSessions.add(session.id);
    for (const r of results) {
      if (r.result.type !== "golf") continue;
      const actual = golfResultCount(r.result);
      faktiskeReps += actual;
      ballerSlatt += r.result.repsLowSpeed + r.result.repsAutomatic + r.result.repsHit;
      svingerUtenBall += r.result.repsWithoutBall;
      const axis = r.source.pyramid;
      akseMap.get(axis)!.faktiskReps += actual;
      const type = r.source.repType === "BALLER_SLATT" || r.source.repType === "SVINGER_UTEN_BALL" ? r.source.repType : "UKJENT";
      const bucket = repTypeMap.get(type) ?? { planlagt: 0, faktisk: 0 };
      bucket.faktisk += actual;
      repTypeMap.set(type, bucket);
    }
  }
  for (const row of ballCounts) {
    if (detailedGolfSessions.has(row.planSessionId)) continue;
    const actual = row._sum.count ?? 0;
    faktiskeReps += actual;
    ballerSlatt += actual;
    const session = visibleSessions.find(item => item.id === row.planSessionId);
    if (session) akseMap.get(session.pyramidArea)!.faktiskReps += actual;
    const bucket = repTypeMap.get("BALLER_SLATT") ?? { planlagt: 0, faktisk: 0 };
    bucket.faktisk += actual;
    repTypeMap.set("BALLER_SLATT", bucket);
  }

  const gjennomforteOkter = visibleSessions.filter((s) => s.status === "COMPLETED").length;
  const planlagteOkter = visibleSessions.length;
  const etterlevelsePct =
    (await hentEtterlevelse(userId, input.now ?? new Date())).pct;

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
