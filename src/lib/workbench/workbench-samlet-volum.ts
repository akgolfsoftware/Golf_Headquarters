import "server-only";
import { prisma } from "@/lib/prisma";
import { tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { osloInstant } from "@/lib/jarvis/dagen";
import { GENERERT_FRA } from "./v2-drill-mirror";
import { mapSession, tilDatoKolonne } from "./wb-map";
import { ownGroupPublicationWhere } from "./group-scope";
import { visibleV2Where } from "@/lib/portal/visible-v2";
import type { TreningsvolumOkt } from "./treningsvolum";
import type { SamletVindu } from "./workbench-samlet-typer";

export function samletOsloMidnatt(dato: string): Date {
  const [aar, maned, dag] = dato.split("-").map(Number);
  return osloInstant(aar, maned, dag, 0, 0);
}

/** Intern leser ETTER loadWorkbenchSamletData sin eier-/samtykkevakt.
 * Kalenderplan og volum bruker samme halvåpne datovindu. */
export async function lastSamletVolumgrunnlag(playerId: string, viewerId: string, vindu: SamletVindu) {
  const v2Where = await visibleV2Where(playerId);
  const [rows, legacy, v2] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        playerId, date: { gte: tilDatoKolonne(vindu.fraDato), lt: tilDatoKolonne(vindu.tilDato) },
        ...(viewerId === playerId ? { hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] } : {}),
      },
      include: { drills: true }, orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    }),
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: playerId, isActive: true, status: { in: ["ACCEPTED", "ACTIVE", "PAUSED"] } },
        scheduledAt: { gte: samletOsloMidnatt(vindu.fraDato), lt: samletOsloMidnatt(vindu.tilDato) },
      },
      select: {
        id: true, scheduledAt: true, durationMin: true, pyramidArea: true, status: true, updatedAt: true,
        log: { select: { startedAt: true, completedAt: true } },
      },
    }),
    prisma.trainingSessionV2.findMany({
      where: { ...v2Where, startTime: { gte: samletOsloMidnatt(vindu.fraDato), lt: samletOsloMidnatt(vindu.tilDato) } },
      select: { id: true, startTime: true, endTime: true, practiceType: true, status: true,
        generertFra: true, generertFraId: true, updatedAt: true },
    }),
  ]);
  const legacyIds = legacy.map(r => r.id);
  // Et flyttet/skjult/annullert speil utenfor vinduet skal også erstatte originalen.
  const [migrerte, v2Speil] = legacyIds.length ? await Promise.all([
    prisma.workbenchSession.findMany({
      where: { playerId, migrertFraTrainingPlanSessionId: { in: legacyIds } },
      select: { migrertFraTrainingPlanSessionId: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: playerId, generertFra: GENERERT_FRA, generertFraId: { in: legacyIds } },
      select: { generertFraId: true },
    }),
  ]) : [[], []];
  const erstattet = new Set([...migrerte.map(r => r.migrertFraTrainingPlanSessionId), ...v2Speil.map(r => r.generertFraId)]);
  const v2PlanIds = v2.filter(r => r.generertFra === GENERERT_FRA && r.generertFraId).map(r => r.generertFraId as string);
  const v2Migrerte = v2PlanIds.length ? await prisma.workbenchSession.findMany({
    where: { playerId, migrertFraTrainingPlanSessionId: { in: v2PlanIds } },
    select: { migrertFraTrainingPlanSessionId: true },
  }) : [];
  const erstattetV2 = new Set(v2Migrerte.map(r => r.migrertFraTrainingPlanSessionId));
  const okter: TreningsvolumOkt[] = rows.map(r => ({
    id: r.id, date: r.date, startMinute: r.startMinute, pyramid: r.pyramid,
    durationMinutes: r.durationMinutes, actualMinutes: r.actualMinutes, status: r.status,
    updatedAt: r.updatedAt, isTemplate: r.isTemplate, hiddenByPlayer: r.hiddenByPlayer,
    needsPlayerApproval: r.needsPlayerApproval, approvalStatus: r.approvalStatus,
    migrertFraTrainingPlanSessionId: r.migrertFraTrainingPlanSessionId, kilde: "workbench",
  }));
  for (const r of legacy) {
    if (erstattet.has(r.id)) continue;
    const oslo = tilNaivVeggklokke(r.scheduledAt);
    const elapsed = r.log?.completedAt && r.log.startedAt
      ? (r.log.completedAt.getTime() - r.log.startedAt.getTime()) / 60_000 : null;
    okter.push({
      id: r.id, date: new Date(Date.UTC(oslo.getFullYear(), oslo.getMonth(), oslo.getDate())),
      startMinute: oslo.getHours() * 60 + oslo.getMinutes(), pyramid: r.pyramidArea,
      durationMinutes: r.durationMin, actualMinutes: null,
      status: r.status === "ACTIVE" || r.status === "PAUSED" ? "IN_PROGRESS" : r.status,
      updatedAt: r.updatedAt, kilde: "legacy",
      // Loggens klokketid er et kildeanslag, ikke målt aktivitet eller planvarighet.
      legacyAnslagMinutter: elapsed !== null && Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null,
    });
  }
  for (const r of v2) {
    if (r.generertFra === GENERERT_FRA && r.generertFraId && erstattetV2.has(r.generertFraId)) continue;
    const oslo = tilNaivVeggklokke(r.startTime);
    const akser = { BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL" };
    okter.push({
      id: r.generertFra === GENERERT_FRA && r.generertFraId ? r.generertFraId : `v2:${r.id}`,
      date: new Date(Date.UTC(oslo.getFullYear(), oslo.getMonth(), oslo.getDate())),
      startMinute: oslo.getHours() * 60 + oslo.getMinutes(), pyramid: akser[r.practiceType],
      durationMinutes: Math.max(0, (r.endTime.getTime() - r.startTime.getTime()) / 60_000),
      actualMinutes: null, status: r.status, updatedAt: r.updatedAt, kilde: "legacy",
    });
  }
  return { okter, sessions: rows.map(mapSession) };
}
