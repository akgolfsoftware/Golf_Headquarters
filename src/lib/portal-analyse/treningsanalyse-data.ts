/**
 * Bølge 5 — treningsanalyse: planlagt vs gjennomført + repstype-fordeling.
 * Aggregerer TrainingDrillV2 (plan) + DrillLogV2 (faktisk) for én spiller.
 */

import { hentEtterlevelse } from "@/lib/portal/etterlevelse-data";
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
  const [sessions, workbench, ballCounts, wbLogger] = await Promise.all([
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
            drills: {
              select: {
                id: true,
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
    // Reps per øvelse fra live-økta (krav 2, 09.10.2026).
    wbIds.length === 0
      ? []
      : prisma.workbenchDrillLog.findMany({
          where: { sessionId: { in: wbIds }, playerId: userId },
          select: { sessionId: true, drillId: true, reps: true, motorikk: true },
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

  // Workbench-volum er validert i egne felt. Slagtelleren er lagret per økt,
  // ikke per øvelse, så faktiske baller kan knyttes til aksen, men ikke
  // fordeles på øvelser uten å gjette.
  for (const session of visibleSessions.filter(item => item.model !== "v2")) {
    const axis = akseMap.get(session.pyramidArea)!;
    axis.planlagtMin += session.durationMin;
    axis.okter.add(session.id);
  }
  for (const session of workbench) {
    for (const drill of session.drills) {
      const type = drill.repType as RepType | null;
      if (!type) continue;
      const planned = type === "SETT_REPS"
        ? (drill.repSett ?? 0) * (drill.repReps ?? 0)
        : type === "TID" ? 0 : (drill.repAntall ?? 0);
      planlagteReps += planned;
      if (type === "TID") tidMinutter += drill.repMinutter ?? 0;
      if (type === "SETT_REPS") settReps += planned;
      const bucket = repTypeMap.get(type) ?? { planlagt: 0, faktisk: 0 };
      bucket.planlagt += planned;
      repTypeMap.set(type, bucket);
    }
  }
  // Økter med reps per øvelse teller faktiske reps derfra; slagtellerens
  // baller for samme økt telles da bare som baller, ikke som reps to ganger.
  const oekterMedOvelseslogg = new Set<string>();
  for (const logg of wbLogger) {
    if (logg.reps <= 0) continue;
    oekterMedOvelseslogg.add(logg.sessionId);
    faktiskeReps += logg.reps;
    if (logg.motorikk === "UTEN_BALL") svingerUtenBall += logg.reps;
    const session = visibleSessions.find(item => item.id === logg.sessionId);
    if (session) akseMap.get(session.pyramidArea)!.faktiskReps += logg.reps;
    const drill = workbench.find(w => w.id === logg.sessionId)?.drills.find(d => d.id === logg.drillId);
    const type: RepType | "UKJENT" = (drill?.repType as RepType | null) ?? "UKJENT";
    const bucket = repTypeMap.get(type) ?? { planlagt: 0, faktisk: 0 };
    bucket.faktisk += logg.reps;
    repTypeMap.set(type, bucket);
  }
  for (const row of ballCounts) {
    const actual = row._sum.count ?? 0;
    ballerSlatt += actual;
    if (oekterMedOvelseslogg.has(row.planSessionId)) continue;
    faktiskeReps += actual;
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
