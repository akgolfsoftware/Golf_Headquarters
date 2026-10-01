/**
 * WorkbenchSession → live-view. Ingen Prisma. Ingen oppdiktede TrackMan-tall.
 */

import type { PyramidArea, SessionStatusV2 } from "@/generated/prisma/client";
import type { LiveV2Drill, LiveV2Summary } from "@/components/portal/live/types";
import type { LiveSessionData, LiveStatus } from "./types";
import { osloInstant } from "@/lib/jarvis/dagen";

import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
import { mengdeTekst } from "@/lib/domain/workbench/ovelse-detaljer";
import { golfResultCount, readDrillResults, readCompletedDrillIds } from "./training-result";
import { fysLoggState } from "./fys-registrering";

const PYR = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export type WbLiveDrill = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  sortOrder: number;
  akFormel?: unknown;
  sourceId?: string | null;
  positionTaskId?: string | null;
  exerciseId?: string | null;
  repType?: string | null;
  repAntall?: number | null;
  repMinutter?: number | null;
  repSett?: number | null;
  repReps?: number | null;
};

export type WbLiveInput = {
  id: string;
  title: string;
  status: string;
  pyramid: string;
  durationMinutes: number;
  date: Date;
  startMinute: number;
  location: string | null;
  notes: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  drills: WbLiveDrill[];
  liveSnapshot?: unknown;
  actualMinutes?: number | null;
};

export function asPyramid(raw: string): PyramidArea {
  return (PYR as readonly string[]).includes(raw) ? (raw as PyramidArea) : "TEK";
}

export function wbScheduledAtISO(date: Date, startMinute: number): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const h = Math.floor(startMinute / 60);
  const min = startMinute % 60;
  return osloInstant(y, m + 1, d, h, min).toISOString();
}

export function wbStatusToPlanStatus(status: string): LiveStatus {
  if (status === "IN_PROGRESS") return "ACTIVE";
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "SKIPPED") return "SKIPPED";
  if (status === "CANCELLED") return "CANCELLED";
  return "PLANNED";
}

/** Dose beholdes i sin enhet; kun slag/putter er planlagte golfrepetisjoner. */
export function wbDrillPlan(d: WbLiveDrill, axis: PyramidArea) {
  const parsed = AkFormelSchema.safeParse(d.akFormel);
  const formel = parsed.success ? parsed.data : null;
  const pyramide = formel?.pyramid ?? axis;
  const m = formel?.detaljer?.mengde;
  const plannedReps = pyramide === "FYS" ? 0 :
    m && (m.enhet === "SLAG" || m.enhet === "PUTTER") ? m.antall ?? 0 :
    d.repType === "BALLER_SLATT" || d.repType === "SVINGER_UTEN_BALL" ? d.repAntall ?? 0 : 0;
  return { formel, pyramide, plannedReps, dose: m };
}

export function mapWbToLiveSessionData(row: WbLiveInput): LiveSessionData {
  const axis = asPyramid(row.pyramid);
  const drills = [...row.drills]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d, i) => ({
      id: d.id,
      index: i + 1,
      name: d.title,
      axis: wbDrillPlan(d, axis).pyramide,
      lPhase: null,
      plannedReps: wbDrillPlan(d, axis).plannedReps,
      repsLabel: mengdeTekst(wbDrillPlan(d, axis).dose) ?? "",
      csTarget: null,
      notes: d.description,
      durationMin: d.durationMinutes,
    }));
  const scheduledAtISO = wbScheduledAtISO(row.date, row.startMinute);
  return {
    sessionId: row.id,
    planId: row.id,
    planName: "Plan",
    title: row.title,
    rationale: row.notes,
    location: row.location,
    axis,
    durationMin: row.durationMinutes,
    scheduledAtISO,
    completed: row.status === "COMPLETED",
    status: wbStatusToPlanStatus(row.status),
    liveSnapshot: null,
    drills,
    totalPlannedReps: drills.reduce((sum, d) => sum + d.plannedReps, 0),
    nextSession: null,
  };
}

function wbDrillToLive(d: WbLiveDrill, index: number, axis: PyramidArea): LiveV2Drill {
  const plan = wbDrillPlan(d, axis);
  const strength = plan.formel?.area === "STYRKE";
  return {
    plannedDose: plan.dose ?? null,
    sourceId: d.sourceId ?? null,
    positionTaskId: d.positionTaskId ?? null,
    exerciseId: d.exerciseId ?? null,
    id: d.id,
    index,
    name: d.title,
    description: d.description,
    durationMinutes: d.durationMinutes,
    actualDurationSec: null,
    plannedReps: plan.plannedReps,
    pyramide: plan.pyramide,
    lFase: null,
    notes: d.description,
    repType: d.repType ?? null,
    repAntall: d.repAntall ?? null,
    repMinutter: d.repMinutter ?? null,
    repSett: d.repSett ?? null,
    repReps: d.repReps ?? null,
    fysTreningstype: plan.pyramide === "FYS" ? plan.formel?.area ?? null : null,
    fysMuskelgruppe: null,
    fysSett: strength ? plan.dose?.antall ?? d.repSett ?? null : null,
    fysReps: strength ? plan.dose?.reps ?? d.repReps ?? null : null,
    fysVektKg: strength ? plan.dose?.vektKg ?? null : null,
    fysTempo: null,
    fysPauseSek: strength ? plan.dose?.pauseSek ?? null : null,
    fysVarighetMin: plan.pyramide === "FYS" && plan.dose?.enhet === "MINUTTER" ? plan.dose.antall ?? null : d.repMinutter ?? null,
    fysIntensitetsSone: null,
    fysDistanseM: null,
    fysAktivitet: null,
    fysBevegelighetType: null,
    fysHoldSek: null,
  };
}

export function mapWbToLiveSummary(row: WbLiveInput, ballCounts: ReadonlyArray<{ count: number }> = []): LiveV2Summary {
  const axis = asPyramid(row.pyramid);
  const results = readDrillResults(row.liveSnapshot);
  const drills = [...row.drills]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d, i) => {
      const source = results.find(r => r.drillId === d.id)?.source;
      return wbDrillToLive(source ? { ...d, title: source.title, durationMinutes: source.durationMinutes,
        akFormel: source.akFormel, sourceId: source.sourceId, positionTaskId: source.positionTaskId,
        exerciseId: source.exerciseId, repType: source.repType, repAntall: source.repAntall,
        repMinutter: source.repMinutter, repSett: source.repSett, repReps: source.repReps } : d,
        i + 1, source?.pyramid ?? axis);
    });
  const logs = results.map(r => {
    const state = r.result.type === "golf" ? { repsTotal: golfResultCount(r.result), ...r.result, logNotes: r.result.notat } : fysLoggState(r.result);
    return { drillId: r.drillId, repsTotal: state.repsTotal, repsWithoutBall: state.repsWithoutBall, repsLowSpeed: state.repsLowSpeed, repsAutomatic: state.repsAutomatic, repsHit: state.repsHit, notes: state.logNotes ?? null, successRate: state.repsTotal > 0 ? Math.round(state.repsHit / state.repsTotal * 100) : 0, loggedAt: r.loggedAt };
  });
  for (const drill of drills) drill.actualDurationSec = results.find(r => r.drillId === drill.id)?.actualDurationSec ?? null;
  const golfResults = results.filter(r => r.result.type === "golf");
  const pyramidSummary = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const r of golfResults) pyramidSummary[r.source.pyramid] += golfResultCount(r.result);
  const scheduledAtISO = wbScheduledAtISO(row.date, row.startMinute);
  const end = new Date(new Date(scheduledAtISO).getTime() + row.durationMinutes * 60_000);
  const status = "COMPLETED" satisfies SessionStatusV2;
  return {
    sessionId: row.id,
    title: row.title,
    coachComment: row.notes,
    focus: null,
    status,
    scheduledAtISO,
    endTimeISO: end.toISOString(),
    location: row.location,
    maalsetning: row.notes,
    coachName: null,
    publishedAtISO: (row.publishedAt ?? row.createdAt).toISOString(),
    completed: true,
    studentName: null,
    pyramide: axis,
    drills,
    existingLogs: logs,
    trainingResults: results,
    completedSummary: null,
    // Planlagt tid er ikke målt treningstid. Utelates når den ikke finnes.
    ...(golfResults.length === 0 ? { logSource: "tapper" as const } : {}),
    durationSec: row.actualMinutes != null ? row.actualMinutes * 60 : 0,
    totalReps: golfResults.length ? golfResults.reduce((sum, r) => sum + golfResultCount(r.result), 0) : ballCounts.reduce((sum, r) => sum + r.count, 0),
    drillsCompleted: readCompletedDrillIds(row.liveSnapshot).filter(id => drills.some(d => d.id === id)).length,
    pyramidSummary,
  };
}
