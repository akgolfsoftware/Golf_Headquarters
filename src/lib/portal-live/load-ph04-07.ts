/** Live-lesere: ekte økt, tilgang og registreringer. Ingen demonstrasjonsreserve. */
import "server-only";
import { prisma } from "@/lib/prisma";
import { AkFormelLeseSchema } from "@/lib/domain/workbench/schemas";
import { executionSeconds, jsonObject, readSessionExecution } from "@/lib/workbench/wb-session-life";
import { planlagtMengde } from "./wb-ovelse-logg";
import { parsePlannedReps } from "./data";
import { wbScheduledAtISO } from "./wb-live-map";
import { loadAuthorizedLiveSource, type LiveSource } from "./session-source";
import { readPlanProgress, readPrecisionProgress, readLiveReflection } from "./session-progress";
import { fysVisningsrader, lesFysRegistrering } from "./fys-registrering";
import { type LiveBriefData, type LiveAktivData, type SlagtellerData, type OktoppsummeringData, type DrillItem, type AkseType, type FysDrillPlan, DEFAULT_BAG_CLUBS, formatTimerOgMinutter } from "./ph04-07-data";

function axis(value: string | null | undefined): AkseType {
  const v = value?.toLowerCase();
  return v === "fys" || v === "tek" || v === "slag" || v === "spill" || v === "turn" ? v : "tek";
}
const clock = (value: Date) => value.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const date = (value: Date) => value.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "numeric", timeZone: "Europe/Oslo" });
function finite(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null; }
function snapshot(source: LiveSource) { return source.kind === "v2" ? source.row.completedSummary : source.row.liveSnapshot; }

async function view(source: LiveSource) {
  const videos = await prisma.playerSwingVideo.groupBy({ by: ["drillId"], where: { userId: source.viewer.role === "PLAYER" ? source.viewer.id : source.ownerId,
    liveSessionId: source.row.id, liveSessionKind: source.kind === "v2" ? "session-v2" : source.kind === "plan" ? "plan-session" : "workbench" }, _count: { _all: true } });
  const rawProgress = jsonObject(snapshot(source));
  const snapshotProgress = rawProgress?.precisionLive !== undefined ? readPrecisionProgress(rawProgress) : readPlanProgress(rawProgress?.drills);
  const progress = source.kind === "plan" && source.row.status === "COMPLETED" && source.row.log?.drillAggregates != null
    ? readPlanProgress(source.row.log.drillAggregates) : snapshotProgress;
  let drills: DrillItem[];
  let scheduled: Date;
  let totalMinutes: number;
  let area: AkseType;
  let goal: string;
  let focus: string;
  if (source.kind === "workbench") {
    const wb = source.row;
    scheduled = new Date(wbScheduledAtISO(wb.date, wb.startMinute)); totalMinutes = wb.durationMinutes; area = axis(wb.pyramid);
    goal = wb.maalsetning ?? wb.rationale ?? ""; focus = wb.notes ?? "";
    drills = wb.drills.map((d) => {
      const log = wb.drillLogs.find((l) => l.drillId === d.id);
      const formel = AkFormelLeseSchema.safeParse(d.akFormel);
      const saved = progress.find((p) => p.drillId === d.id);
      const f = formel.success ? formel.data : null;
      const fys: FysDrillPlan | undefined = f?.pyramid === "FYS" ? {
        type: f.area === "STYRKE" ? "styrke" : f.area === "KONDISJON" ? "kondisjon" : f.area === "BEVEGELIGHET" ? "reps" : undefined,
        sett: d.repSett ?? undefined, reps: d.repReps ?? f.detaljer?.mengde?.reps, vektKg: f.detaljer?.mengde?.vektKg,
        minutter: d.repMinutter ?? undefined, segmenter: f.detaljer?.kondisjonssegmenter,
      } : undefined;
      return { id: d.id, code: "", name: d.title, club: "", param: d.description ?? undefined,
        quantity: planlagtMengde(d) ?? 0, unit: d.repType === "TID" ? "min" : "reps", minutes: d.durationMinutes,
        axis: axis(formel.success ? formel.data.pyramid : wb.pyramid), repsCompleted: log?.reps ?? saved?.reps ?? 0,
        kommentar: log?.kommentar ?? saved?.kommentar ?? undefined, videoer: videos.find((v) => v.drillId === d.id)?._count._all ?? 0,
        elapsedSec: saved?.elapsedSec, status: saved?.status, fys };
    });
  } else if (source.kind === "v2") {
    const row = source.row;
    const logs = await prisma.drillLogV2.findMany({ where: { drill: { sessionId: row.id }, loggedBy: source.viewer.role === "PLAYER" ? source.viewer.id : source.ownerId }, orderBy: { loggedAt: "desc" } });
    scheduled = row.startTime; totalMinutes = Math.max(0, Math.round((row.endTime.getTime() - row.startTime.getTime()) / 60000));
    area = axis(row.drills[0]?.pyramide); goal = row.maalsetning ?? ""; focus = row.notes ?? "";
    drills = row.drills.map((d) => {
      const log = logs.find((l) => l.drillId === d.id); const saved = progress.find((p) => p.drillId === d.id);
      const quantity = d.repType === "TID" ? d.repMinutter ?? 0 : d.repAntall ?? (d.repSett != null && d.repReps != null ? d.repSett * d.repReps : d.repetitions ?? 0);
      const fys: FysDrillPlan | undefined = d.pyramide === "FYS" ? {
        type: d.fysBevegelighetType === "hold" ? "hold" : d.fysTreningstype === "kondisjon" || d.fysAktivitet || d.repType === "TID" ? "kondisjon"
          : d.fysTreningstype === "bevegelighet" || d.fysBevegelighetType ? "reps" : d.fysTreningstype === "styrke" || d.fysSett != null || d.repSett != null ? "styrke" : undefined,
        sett: d.fysSett ?? d.repSett ?? undefined, reps: d.fysReps ?? d.repReps ?? undefined, vektKg: d.fysVektKg ?? undefined,
        minutter: d.fysVarighetMin ?? d.repMinutter ?? undefined, holdSek: d.fysHoldSek ?? undefined,
        pulssone: d.fysIntensitetsSone != null ? `S${d.fysIntensitetsSone}` : undefined,
      } : undefined;
      return { id: d.id, code: "", name: d.name, club: "", param: d.description ?? undefined,
        quantity, unit: d.repType === "TID" ? "min" : "reps", minutes: d.durationMinutes, axis: axis(d.pyramide),
        repsCompleted: log?.repsTotal ?? saved?.reps ?? 0, hits: log?.repsHit, kommentar: log?.notes ?? saved?.kommentar ?? undefined,
        elapsedSec: saved?.elapsedSec ?? d.actualDurationSec ?? undefined, status: saved?.status, videoer: videos.find((v) => v.drillId === d.id)?._count._all ?? 0, fys };
    });
  } else {
    const row = source.row;
    scheduled = row.scheduledAt; totalMinutes = row.durationMin; area = axis(row.pyramidArea); goal = row.maalsetning ?? ""; focus = row.rationale ?? "";
    drills = row.drills.map((d) => {
      const saved = progress.find((p) => p.drillId === d.id);
      const fys: FysDrillPlan | undefined = (d.pyramidArea ?? row.pyramidArea) === "FYS" ? { type: d.repType === "TID" ? "kondisjon" : d.repSett != null ? "styrke" : undefined,
        sett: d.repSett ?? undefined, reps: d.repReps ?? undefined, minutter: d.repMinutter ?? undefined } : undefined;
      return { id: d.id, code: "", name: d.exercise.name, club: "", param: d.notes ?? undefined,
        quantity: d.repType === "TID" ? d.repMinutter ?? 0 : d.repAntall ?? (d.repSett != null && d.repReps != null ? d.repSett * d.repReps : parsePlannedReps(d)),
        unit: d.repType === "TID" ? "min" : "reps", minutes: d.repType === "TID" ? d.repMinutter ?? 0 : d.exercise.durationMin ?? 0,
        axis: axis(d.pyramidArea ?? row.pyramidArea), repsCompleted: saved?.reps ?? 0, kommentar: saved?.kommentar,
        elapsedSec: saved?.elapsedSec, status: saved?.status, videoer: videos.find((v) => v.drillId === d.id)?._count._all ?? 0, fys };
    });
  }
  const ownPlayer = source.viewer.role === "PLAYER" && source.viewer.id === source.ownerId;
  const blocked = source.row.status === "COMPLETED" ? "completed" : !ownPlayer ? "coach" : source.kind === "workbench" && source.row.needsPlayerApproval ? "approval" : null;
  const brief: LiveBriefData = { sessionId: source.row.id, title: source.row.title, scheduledTime: `${date(scheduled)} · ${clock(scheduled)}`,
    location: source.row.location ?? "", totalMinutes, belastning: null, press: null, goal, focus, axis: area, drills,
    canStart: blocked === null && (source.kind === "workbench" ? ["PUBLISHED", "IN_PROGRESS"].includes(source.row.status) : ["PLANNED", "ACTIVE", "PAUSED", "IN_PROGRESS"].includes(source.row.status)), blockReason: blocked };
  return { brief, scheduled, source };
}

/** Parametrene fra gamle sider beholdes, men innloggingen er eneste identitetskilde. */
export async function loadPH04BriefData(sessionId: string, _userId?: string, _userTier?: string, _isCoach?: boolean): Promise<LiveBriefData> {
  return (await view(await loadAuthorizedLiveSource(sessionId))).brief;
}
export async function loadPH05ActiveData(sessionId: string, _userId?: string): Promise<LiveAktivData> {
  const source = await loadAuthorizedLiveSource(sessionId);
  const { brief } = await view(source);
  const execution = readSessionExecution(snapshot(source));
  const current = brief.drills.findIndex((d) => d.status === "active");
  return { sessionId, title: brief.title, totalMinutes: brief.totalMinutes, initialSeconds: execution ? executionSeconds(execution) : finite(jsonObject(snapshot(source))?.totalSec) ?? 0,
    drills: brief.drills, currentDrillIndex: current >= 0 ? current : Math.max(0, brief.drills.findIndex((d) => d.status !== "done")),
    lagring: source.kind, eierUserId: source.viewer.id, pauset: execution?.phase === "PAUSED" || source.row.status === "PAUSED" };
}
export async function loadWbLiveAktiv(sessionId: string): Promise<LiveAktivData | null> {
  return loadPH05ActiveData(sessionId);
}
export async function loadPH06TapperData(sessionId: string, _userId?: string): Promise<SlagtellerData> {
  const source = await loadAuthorizedLiveSource(sessionId);
  const { brief } = await view(source);
  const counts = await prisma.sessionBallLog.findMany({ where: { planSessionId: sessionId }, select: { club: true, count: true } });
  const activeDrill = brief.drills.find((d) => d.status === "active") ?? brief.drills[0] ?? null;
  const selectedClub = DEFAULT_BAG_CLUBS[0];
  return { sessionId, title: brief.title, activeDrill, drillIndex: activeDrill ? brief.drills.indexOf(activeDrill) : 0, totalDrills: brief.drills.length,
    bagClubs: [...new Set([...DEFAULT_BAG_CLUBS, ...counts.map((c) => c.club)])], selectedClub, totalShotsGoal: activeDrill?.quantity ?? 0,
    currentShots: counts.reduce((sum, c) => sum + c.count, 0), trackmanShot: null, isPutterSelected: selectedClub === "P", counts, countsByClub: Object.fromEntries(counts.map((c) => [c.club, c.count])), eierUserId: source.viewer.id };
}
export async function loadPH07SummaryData(sessionId: string, _userId?: string, _playerName?: string): Promise<OktoppsummeringData> {
  const source = await loadAuthorizedLiveSource(sessionId);
  const { brief, scheduled } = await view(source);
  const [ballLogs, player] = await Promise.all([
    prisma.sessionBallLog.findMany({ where: { planSessionId: sessionId }, select: { count: true } }),
    prisma.user.findUnique({ where: { id: source.ownerId }, select: { name: true } }),
  ]);
  const raw = jsonObject(snapshot(source)); const liveSummary = jsonObject(raw?.liveSummary);
  const execution = readSessionExecution(raw);
  const measuredSeconds = execution && (typeof raw?.startedAtISO === "string" || execution.accumulatedSec > 0) ? executionSeconds(execution)
    : source.kind === "v2" ? finite(liveSummary?.durationSec) : typeof raw?.startedAtISO === "string" ? finite(raw?.totalSec) : null;
  const logDuration = source.kind === "plan" && source.row.log?.completedAt && source.row.log.completedAt > source.row.log.startedAt ? (source.row.log.completedAt.getTime() - source.row.log.startedAt.getTime()) / 60000 : null;
  const actualMinutes = source.kind === "workbench" && source.row.actualMinutes != null ? source.row.actualMinutes : measuredSeconds != null ? Math.round(measuredSeconds / 60) : logDuration;
  const loggedReps = brief.drills.filter((d) => d.axis !== "fys").reduce((sum, d) => sum + (d.repsCompleted ?? 0), 0);
  const totalShots = ballLogs.length ? ballLogs.reduce((sum, b) => sum + b.count, 0) : finite(raw?.tapperTotalShots) ?? loggedReps;
  const completedIds = Array.isArray(liveSummary?.completedDrillIds) ? liveSummary.completedDrillIds.filter((id): id is string => typeof id === "string") : [];
  const reflection = readLiveReflection(raw, source.viewer.id === source.ownerId);
  const start = typeof raw?.startedAtISO === "string" ? raw.startedAtISO : typeof liveSummary?.startedAt === "string" ? liveSummary.startedAt : null;
  const end = typeof liveSummary?.completedAt === "string" ? liveSummary.completedAt : source.kind === "plan" ? source.row.log?.completedAt?.toISOString() : null;
  return { sessionId, eierUserId: source.viewer.id, title: brief.title, playerName: player?.name?.split(" ")[0] ?? "Spiller", dateStr: date(scheduled),
    timeRangeStr: start && end && Number.isFinite(Date.parse(start)) && Number.isFinite(Date.parse(end)) ? `${clock(new Date(start))}–${clock(new Date(end))}` : "Tidspunkt ikke registrert",
    totalShots, actualMinutes, plannedMinutes: brief.totalMinutes, completedDrillsCount: brief.drills.filter((d) => d.status === "done" || completedIds.includes(d.id)).length,
    totalDrillsCount: brief.drills.length, dagsform: "", axes: (["fys", "tek", "slag", "spill", "turn"] as const).map((a) => {
      const matching = brief.drills.filter((d) => d.axis === a);
      return { axis: a, actualMin: matching.length && matching.every((d) => d.elapsedSec != null) ? matching.reduce((sum, d) => sum + (d.elapsedSec ?? 0), 0) / 60 : null,
        plannedMin: matching.reduce((sum, d) => sum + d.minutes, 0) };
    }), drillRows: brief.drills.map((d) => {
      const physical = d.axis === "fys" ? lesFysRegistrering(d.kommentar) : null;
      return { id: d.id, name: d.name, quantityText: physical ? fysVisningsrader(physical).map((r) => r.verdi).join(" · ") : `${d.repsCompleted ?? 0} ${d.unit}`,
        timeText: d.elapsedSec == null ? physical?.type === "kondisjon" ? formatTimerOgMinutter(physical.minutter) : "Ikke registrert" : formatTimerOgMinutter(d.elapsedSec / 60),
        hitsText: d.axis === "fys" ? "Ikke aktuelt" : d.hits == null ? "Ikke registrert" : `${d.hits} / ${d.repsCompleted ?? 0}` };
    }), ...reflection };
}
