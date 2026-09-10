/**
 * WorkbenchSession → live-view. Ingen Prisma. Ingen oppdiktede TrackMan-tall.
 */

import type { PyramidArea, SessionStatusV2 } from "@/generated/prisma/client";
import type { LiveV2Drill, LiveV2Summary } from "@/components/portal/live/types";
import type { LiveSessionData, LiveStatus } from "./types";

const PYR = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export type WbLiveDrill = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  sortOrder: number;
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
  return new Date(Date.UTC(y, m, d, h, min, 0)).toISOString();
}

export function wbStatusToPlanStatus(status: string): LiveStatus {
  if (status === "IN_PROGRESS") return "ACTIVE";
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "SKIPPED") return "SKIPPED";
  if (status === "CANCELLED") return "CANCELLED";
  return "PLANNED";
}

export function mapWbToLiveSessionData(row: WbLiveInput): LiveSessionData {
  const axis = asPyramid(row.pyramid);
  const drills = [...row.drills]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d, i) => ({
      id: d.id,
      index: i + 1,
      name: d.title,
      axis,
      lPhase: null,
      plannedReps: 0,
      repsLabel: "",
      csTarget: null,
      notes: d.description,
    }));
  const scheduledAtISO = wbScheduledAtISO(row.date, row.startMinute);
  return {
    sessionId: row.id,
    planId: row.id,
    planName: "Plan",
    title: row.title,
    rationale: row.notes,
    axis,
    durationMin: row.durationMinutes,
    scheduledAtISO,
    completed: row.status === "COMPLETED",
    status: wbStatusToPlanStatus(row.status),
    liveSnapshot: null,
    drills,
    totalPlannedReps: 0,
    nextSession: null,
  };
}

function wbDrillToLive(d: WbLiveDrill, index: number, axis: PyramidArea): LiveV2Drill {
  return {
    id: d.id,
    index,
    name: d.title,
    description: d.description,
    durationMinutes: d.durationMinutes,
    actualDurationSec: null,
    plannedReps: 0,
    pyramide: axis,
    lFase: null,
    notes: d.description,
    repType: null,
    repAntall: null,
    repMinutter: null,
    repSett: null,
    repReps: null,
    fysTreningstype: null,
    fysMuskelgruppe: null,
    fysSett: null,
    fysReps: null,
    fysVektKg: null,
    fysTempo: null,
    fysPauseSek: null,
    fysVarighetMin: null,
    fysIntensitetsSone: null,
    fysDistanseM: null,
    fysAktivitet: null,
    fysBevegelighetType: null,
    fysHoldSek: null,
  };
}

export function mapWbToLiveSummary(row: WbLiveInput, ballCounts: ReadonlyArray<{ count: number }> = []): LiveV2Summary {
  const axis = asPyramid(row.pyramid);
  const drills = [...row.drills]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d, i) => wbDrillToLive(d, i + 1, axis));
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
    existingLogs: [],
    completedSummary: null,
    // Planlagt tid er ikke målt treningstid. Utelates når den ikke finnes.
    logSource: "tapper",
    durationSec: 0,
    totalReps: ballCounts.reduce((sum, r) => sum + r.count, 0),
    drillsCompleted: 0,
    pyramidSummary: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
  };
}
