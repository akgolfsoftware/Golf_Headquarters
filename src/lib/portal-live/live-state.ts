import type { LiveV2Session, LiveV2Drill, DrillRepState } from "@/components/portal/live/types";
import type { LiveDrillKoRad, LiveDrillReps } from "@/lib/offline-queue/live-drill-kladd";
export type LiveDrillState = LiveV2Drill & DrillRepState & { status: "done" | "active" | "queued" };
export type RepBucket = "repsWithoutBall" | "repsLowSpeed" | "repsAutomatic" | "repsHit";
export type LiveState = { drills: LiveDrillState[]; totalSec: number; drillSec: number; paused: boolean };
const count = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

export function restoreLiveState(data: LiveV2Session, cached: LiveDrillKoRad | null): LiveState {
  const local = cached?.sessionId === data.sessionId && Array.isArray(cached.drills) ? cached : null;
  const drills: LiveDrillState[] = data.drills.map((drill) => {
    const log = data.existingLogs.find((l) => l.drillId === drill.id);
    const draft = local?.drills.find((d) => d.drillId === drill.id);
    const useDraft = draft && (!log || local?.synketRevision == null || local.synketRevision !== local.revision || (local?.sistOppdatert ?? "") >= log.loggedAt);
    const source = useDraft ? draft : log;
    return { ...drill, status: useDraft && ["done", "active"].includes(draft.status) ? draft.status : "queued",
      repsTotal: count(source?.repsTotal), repsWithoutBall: count(source?.repsWithoutBall), repsLowSpeed: count(source?.repsLowSpeed), repsAutomatic: count(source?.repsAutomatic), repsHit: count(source?.repsHit), logNotes: source?.notes ?? undefined,
      actualDurationSec: useDraft ? Math.max(drill.actualDurationSec ?? 0, count(draft.actualDurationSec)) : drill.actualDurationSec };
  });
  let active = false;
  for (const drill of drills) { if (drill.status === "active") { if (active) drill.status = "queued"; active = true; } }
  if (!active) { const first = drills.find((d) => d.status !== "done"); if (first) first.status = "active"; }
  return { drills, totalSec: local ? count(local.totalSec) : drills.reduce((sum, d) => sum + count(d.actualDurationSec), 0), drillSec: local?.drillSec != null ? count(local.drillSec) : count(drills.find((d) => d.status === "active")?.actualDurationSec), paused: local?.paused === true };
}

export function livePayload(state: LiveState): LiveDrillReps[] {
  return state.drills.map((d) => ({ drillId: d.id, repsTotal: d.repsTotal, repsWithoutBall: d.repsWithoutBall, repsLowSpeed: d.repsLowSpeed, repsAutomatic: d.repsAutomatic, repsHit: d.repsHit, notes: d.logNotes, status: d.status, actualDurationSec: d.status === "active" ? Math.max(d.actualDurationSec ?? 0, state.drillSec) : d.actualDurationSec ?? undefined }));
}

export function adjustLiveRep(state: LiveState, drillId: string, bucket: RepBucket, delta: number): LiveState {
  return { ...state, drills: state.drills.map((d) => {
    if (d.id !== drillId) return d;
    const next = { ...d, [bucket]: Math.max(0, d[bucket] + delta) };
    return { ...next, repsTotal: next.repsWithoutBall + next.repsLowSpeed + next.repsAutomatic + next.repsHit };
  }) };
}

export function markLiveDrill(state: LiveState, drillId: string, done: boolean): LiveState {
  const selected = state.drills.find((d) => d.id === drillId);
  if (!selected) return state;
  const drills = state.drills.map((d): LiveDrillState => d.id === drillId ? { ...d, status: done ? "done" : "queued", actualDurationSec: d.status === "active" ? Math.max(d.actualDurationSec ?? 0, state.drillSec) : d.actualDurationSec } : { ...d });
  if (!drills.some((d) => d.status === "active")) { const first = drills.find((d) => d.status === "queued"); if (first) first.status = "active"; }
  return { ...state, drills, drillSec: selected.status === "active" || !state.drills.some((d) => d.status === "active") ? count(drills.find((d) => d.status === "active")?.actualDurationSec) : state.drillSec };
}
