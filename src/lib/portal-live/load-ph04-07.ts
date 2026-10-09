/**
 * Kilde: ui_kits/playerhq/screens/PH-04.jsx, PH-05.jsx, PH-06.jsx, PH-07.jsx.
 * Server-loader for PH 04–07 Live-økt gjennomføring i Precision Athletics.
 *
 * Støtter:
 * - WorkbenchSession (dagens og fremtidige økter)
 * - TrainingPlanSession (eldre plan-økter)
 * - TrainingSessionV2
 * - Syntetisk fallback for demo, tomme tilstander og frakoblede tester
 */

import { prisma } from "@/lib/prisma";
import { AkFormelLeseSchema } from "@/lib/domain/workbench/schemas";
import { executionSeconds, readSessionExecution } from "@/lib/workbench/wb-session-life";
import { planlagtMengde } from "./wb-ovelse-logg";
import {
  type LiveBriefData,
  type LiveAktivData,
  type SlagtellerData,
  type OktoppsummeringData,
  type DrillItem,
  type TrackManShot,
  DEFAULT_BAG_CLUBS,
  formatTimerOgMinutter,
} from "./ph04-07-data";

const DEFAULT_DRILLS: DrillItem[] = [
  {
    id: "drill-1",
    code: "DR-01",
    name: "Innspill 100–150 m · Lengdekontroll",
    club: "PW",
    param: "50 % trykk",
    quantity: 30,
    unit: "slag",
    minutes: 25,
    axis: "slag",
    repsCompleted: 18,
    hits: 15,
  },
  {
    id: "drill-2",
    code: "DR-02",
    name: "Pitching 30–60 m · Landingssone",
    club: "54",
    param: "3 soner",
    quantity: 25,
    unit: "slag",
    minutes: 20,
    axis: "slag",
    repsCompleted: 0,
    hits: 0,
  },
  {
    id: "drill-3",
    code: "DR-03",
    name: "Putterulling 3–6 m · Portøvelse",
    club: "P",
    param: "2 porter",
    quantity: 20,
    unit: "putter",
    minutes: 15,
    axis: "spill",
    repsCompleted: 0,
    hits: 0,
  },
  {
    id: "drill-4",
    code: "DR-04",
    name: "Driver · Senterballhastighet",
    club: "Dr",
    param: "Tee 45 mm",
    quantity: 15,
    unit: "slag",
    minutes: 15,
    axis: "slag",
    repsCompleted: 0,
    hits: 0,
  },
];

const DEFAULT_TRACKMAN: TrackManShot = {
  carry: 114.2,
  clubSpeed: 82.4,
  ballSpeed: 108.6,
  smashFactor: 1.32,
  launchAngle: 18.4,
  clubPath: 1.8,
  timestamp: "14:41",
  bay: "BAY 3",
};

/** Laster data for PH-04 Live brief */
export async function loadPH04BriefData(
  sessionId: string,
  userId: string,
  userTier = "FULL",
  isCoach = false,
): Promise<LiveBriefData> {
  // Sjekk WorkbenchSession
  const wb = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: { orderBy: { sortOrder: "asc" } } },
  });

  if (wb) {
    const drills: DrillItem[] = wb.drills.map((d, i) => ({
      id: d.id,
      code: `DR-${String(i + 1).padStart(2, "0")}`,
      name: d.title,
      club: "PW",
      param: d.description || undefined,
      quantity: d.repAntall || d.repReps || 20,
      unit: "slag",
      minutes: d.durationMinutes || 15,
      axis: (wb.pyramid?.toLowerCase() as DrillItem["axis"]) || "slag",
      repsCompleted: 0,
    }));

    const canStart =
      !isCoach &&
      wb.playerId === userId &&
      userTier !== "GRATIS" &&
      wb.status !== "COMPLETED";

    return {
      sessionId: wb.id,
      title: wb.title || "Slagøkt · Range",
      scheduledTime: `${wb.date} · ${Math.floor(wb.startMinute / 60)}:${String(wb.startMinute % 60).padStart(2, "0")}`,
      location: wb.location || "RANGE 3",
      totalMinutes: wb.durationMinutes || 75,
      belastning: "moderat",
      press: "middels",
      goal: wb.notes || "Stabil ballbane og lengdekontroll med wedger.",
      focus: "Senterballtreff og jevn svingbane.",
      axis: (wb.pyramid?.toLowerCase() as DrillItem["axis"]) || "slag",
      trackmanBay: "BAY 3",
      drills: drills.length > 0 ? drills : DEFAULT_DRILLS,
      canStart,
      blockReason: wb.status === "COMPLETED" ? "completed" : isCoach ? "coach" : userTier === "GRATIS" ? "tier" : null,
    };
  }

  // Sjekk TrainingPlanSession
  const plan = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
      drills: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
    },
  });

  if (plan) {
    const drills: DrillItem[] = plan.drills.map((d, i) => ({
      id: d.id,
      code: `DR-${String(i + 1).padStart(2, "0")}`,
      name: d.exercise.name,
      club: "PW",
      param: d.notes || undefined,
      quantity: 20,
      unit: "slag",
      minutes: d.exercise.durationMin || 15,
      axis: (plan.pyramidArea?.toLowerCase() as DrillItem["axis"]) || "slag",
      repsCompleted: 0,
    }));

    const canStart =
      !isCoach &&
      plan.plan.userId === userId &&
      userTier !== "GRATIS" &&
      plan.status !== "COMPLETED";

    return {
      sessionId: plan.id,
      title: plan.title || plan.plan.name || "Treningsøkt",
      scheduledTime: `${plan.scheduledAt.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "numeric" })} · ${plan.scheduledAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`,
      location: plan.location || "RANGE 3",
      totalMinutes: plan.durationMin || 75,
      belastning: "moderat",
      press: "middels",
      goal: plan.rationale || "Teknisk stabilitet og jevn rytme.",
      focus: "Posisjon i baksving og timing.",
      axis: (plan.pyramidArea?.toLowerCase() as DrillItem["axis"]) || "slag",
      trackmanBay: "BAY 3",
      drills: drills.length > 0 ? drills : DEFAULT_DRILLS,
      canStart,
      blockReason: plan.status === "COMPLETED" ? "completed" : isCoach ? "coach" : userTier === "GRATIS" ? "tier" : null,
    };
  }

  // Syntetisk fallback
  return {
    sessionId,
    title: "Slagøkt · Range og nærspill",
    scheduledTime: "I dag · 14:30",
    location: "RANGE 3",
    totalMinutes: 75,
    belastning: "moderat",
    press: "middels",
    goal: "Høyere ballhastighet og senterballtreff på wedger.",
    focus: "Svingbane og kontaktflate.",
    axis: "slag",
    trackmanBay: "BAY 3",
    drills: DEFAULT_DRILLS,
    canStart: !isCoach && userTier !== "GRATIS",
    blockReason: isCoach ? "coach" : userTier === "GRATIS" ? "tier" : null,
  };
}

/** Laster data for PH-05 Live aktiv */
export async function loadPH05ActiveData(
  sessionId: string,
  userId: string,
): Promise<LiveAktivData> {
  const brief = await loadPH04BriefData(sessionId, userId);
  return {
    sessionId,
    title: brief.title,
    totalMinutes: brief.totalMinutes,
    // Ingen lagret starttid for disse økttypene: klokka starter på null.
    initialSeconds: 0,
    drills: brief.drills,
    currentDrillIndex: 0,
  };
}

/**
 * PH-05 for en WorkbenchSession som er i gang: ekte øvelser, lagrede reps,
 * kommentarer og videoer, og klokke fra økt-gjennomføringen. Ingen
 * demoøvelser. Kalleren har allerede sjekket at spilleren eier økta.
 */
export async function loadWbLiveAktiv(sessionId: string): Promise<LiveAktivData | null> {
  const wb = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true, title: true, pyramid: true, durationMinutes: true, liveSnapshot: true,
      drills: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, description: true, durationMinutes: true, repAntall: true, repSett: true, repReps: true, akFormel: true } },
      drillLogs: { select: { drillId: true, reps: true, kommentar: true } },
    },
  });
  if (!wb) return null;
  const videoer = await prisma.playerSwingVideo.groupBy({
    by: ["drillId"],
    where: { liveSessionId: sessionId, liveSessionKind: "workbench" },
    _count: { _all: true },
  });
  const execution = readSessionExecution(wb.liveSnapshot);
  const akse = (p: string | null): DrillItem["axis"] => {
    const a = p?.toLowerCase();
    return a === "fys" || a === "tek" || a === "slag" || a === "spill" || a === "turn" ? a : "slag";
  };
  return {
    sessionId: wb.id,
    title: wb.title,
    totalMinutes: wb.durationMinutes,
    initialSeconds: execution ? executionSeconds(execution) : 0,
    pauset: execution?.phase === "PAUSED",
    lagring: "workbench",
    currentDrillIndex: 0,
    drills: wb.drills.map((d, i) => {
      const logg = wb.drillLogs.find((l) => l.drillId === d.id);
      const formel = AkFormelLeseSchema.safeParse(d.akFormel);
      return {
        id: d.id,
        code: `DR-${String(i + 1).padStart(2, "0")}`,
        name: d.title,
        club: "",
        param: d.description ?? undefined,
        quantity: planlagtMengde(d) ?? 0,
        unit: "reps",
        minutes: d.durationMinutes,
        axis: akse(formel.success ? formel.data.pyramid : wb.pyramid),
        repsCompleted: logg?.reps ?? 0,
        kommentar: logg?.kommentar ?? undefined,
        videoer: videoer.find((v) => v.drillId === d.id)?._count._all ?? 0,
      };
    }),
  };
}

/** Laster data for PH-06 Slagteller */
export async function loadPH06TapperData(
  sessionId: string,
  userId: string,
): Promise<SlagtellerData> {
  const brief = await loadPH04BriefData(sessionId, userId);

  // Hent bagen til spilleren
  const bag = await prisma.equipmentBag.findUnique({
    where: { userId },
  });

  const bagClubs = bag
    ? [
        bag.driver ? "Dr" : null,
        bag.fairwayWoods ? "3W" : null,
        bag.hybrids ? "3H" : null,
        bag.irons ? "7I" : null,
        bag.wedges ? "PW" : null,
        bag.wedges ? "54" : null,
        bag.wedges ? "58" : null,
        bag.putter ? "P" : null,
      ].filter((c): c is string => Boolean(c))
    : [];

  const activeClubs = bagClubs.length > 0 ? bagClubs : DEFAULT_BAG_CLUBS;
  const activeDrill = brief.drills[0] || DEFAULT_DRILLS[0];

  return {
    sessionId,
    title: brief.title,
    activeDrill,
    drillIndex: 0,
    totalDrills: brief.drills.length,
    bagClubs: activeClubs,
    selectedClub: "PW",
    totalShotsGoal: activeDrill.quantity || 30,
    currentShots: 18,
    trackmanShot: DEFAULT_TRACKMAN,
    isPutterSelected: false,
  };
}

/** Laster data for PH-07 Øktoppsummering */
export async function loadPH07SummaryData(
  sessionId: string,
  userId: string,
  playerName = "Anders",
): Promise<OktoppsummeringData> {
  const brief = await loadPH04BriefData(sessionId, userId);

  // Les lagrede session_ball_logs
  const ballLogs = await prisma.sessionBallLog.findMany({
    where: { planSessionId: sessionId },
    select: { count: true },
  });
  const totalRepsFromLogs = ballLogs.reduce((sum, b) => sum + (b.count || 0), 0);
  const totalShots = totalRepsFromLogs > 0 ? totalRepsFromLogs : 112;

  return {
    sessionId,
    title: brief.title,
    playerName,
    dateStr: "LØR 26.09",
    timeRangeStr: "14:30–15:42",
    totalShots,
    actualMinutes: 72,
    plannedMinutes: brief.totalMinutes || 75,
    completedDrillsCount: brief.drills.length,
    totalDrillsCount: brief.drills.length,
    dagsform: "8 / 10",
    axes: [
      { axis: "fys", actualMin: 15, plannedMin: 15 },
      { axis: "tek", actualMin: 20, plannedMin: 20 },
      { axis: "slag", actualMin: 30, plannedMin: 25 },
      { axis: "spill", actualMin: 15, plannedMin: 15 },
      { axis: "turn", actualMin: 0, plannedMin: 0 },
    ],
    drillRows: brief.drills.map((d, _i) => ({
      id: d.id,
      name: d.name,
      quantityText: `${d.quantity} ${d.unit}`,
      timeText: formatTimerOgMinutter(d.minutes),
      hitsText: `${d.hits ?? Math.round(d.quantity * 0.8)} / ${d.quantity}`,
    })),
  };
}
