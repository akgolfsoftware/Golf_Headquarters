/**
 * Data-loader for Coach-Workbench (/admin/spillere/[id]/workbench).
 * Henter ekte Prisma-data og mapper til CoachWorkbenchProps.
 *
 * Coach jobber dypt i én spillers plan: samme uke-kalender spilleren ser,
 * pluss coach-handlinger (plan-godkjenning, avvik, ønsker veiledning, oppgave).
 *
 * Speil av mønster i src/lib/agencyos/daily-brief-data.tsx — ekte data, ingen
 * falske tall. Mangler data → tomt eller utledet.
 */

import { prisma } from "@/lib/prisma";
import type { PyramidArea, PlanStatus, SessionStatus } from "@/generated/prisma/client";
import { PYR_REKKEFOLGE } from "@/lib/pyramide";
import type { CoachWorkbenchProps, WBWeekSession, WBTreeWeek, WBPlanRow, WBStandardSession, WBGoalRow, WBPyramidRow } from "@/components/admin/coach-workbench/coach-workbench";

const DOW = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const MND_SHORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function tierLabel(t: string): string {
  if (t === "PRO") return "PRO";
  if (t === "ELITE") return "ELITE";
  return "GRATIS";
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** ISO-ukenummer. */
function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86_400_000));
}

/** Mandag 00:00 i uka som inneholder `d`. */
function mondayOf(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

const PYR_TONE: Record<PyramidArea, "fys" | "tek" | "slag" | "spill" | "turn"> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

const PYR_SHORT: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  DRAFT: "utkast",
  PENDING_PLAYER: "venter spiller",
  ACCEPTED: "godtatt",
  REJECTED: "endring ønsket",
  ACTIVE: "aktiv",
  PAUSED: "pause",
  ARCHIVED: "arkiv",
};

const SESSION_DONE: SessionStatus[] = ["COMPLETED"];
const SESSION_SKIPPED: SessionStatus[] = ["SKIPPED", "CANCELLED"];

export async function loadCoachWorkbench(playerId: string): Promise<CoachWorkbenchProps | null> {
  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      hcp: true,
      tier: true,
      homeClub: true,
      school: true,
      dateOfBirth: true,
    },
  });
  if (!player) return null;

  const now = new Date();
  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const seksti = new Date(now);
  seksti.setDate(seksti.getDate() - 60);

  const [plans, weekSessions, last30Sessions, prev30Sessions, goals, pendingActions, sessionReqs] =
    await Promise.all([
      prisma.trainingPlan.findMany({
        where: { userId: playerId },
        orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          name: true,
          status: true,
          isActive: true,
          startDate: true,
          endDate: true,
          updatedAt: true,
        },
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: playerId }, scheduledAt: { gte: weekStart, lt: weekEnd } },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          scheduledAt: true,
          durationMin: true,
          title: true,
          pyramidArea: true,
          status: true,
          environment: true,
          _count: { select: { drills: true } },
        },
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: playerId }, scheduledAt: { gte: tretti, lt: now } },
        select: { pyramidArea: true, durationMin: true, status: true },
      }),
      prisma.trainingPlanSession.findMany({
        where: { plan: { userId: playerId }, scheduledAt: { gte: seksti, lt: tretti } },
        select: { pyramidArea: true, durationMin: true },
      }),
      prisma.goal.findMany({
        where: { userId: playerId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, type: true, category: true, targetValue: true },
      }),
      prisma.planAction.findMany({
        where: { userId: playerId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, actionType: true, agentName: true, createdAt: true },
      }),
      prisma.sessionRequest.findMany({
        where: { userId: playerId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, reason: true, preferredArea: true, createdAt: true },
      }),
    ]);

  const activePlan = plans.find((p) => p.isActive) ?? plans[0] ?? null;

  // ── Uke-kalender (07–21) ────────────────────────────────────
  const weekGrid: WBWeekSession[] = weekSessions.map((s) => {
    const start = s.scheduledAt;
    const startMin = start.getHours() * 60 + start.getMinutes();
    const dow = (start.getDay() + 6) % 7; // 0 = mandag
    const env = s.environment;
    const loc = env
      ? { RANGE: "Range", BANE: "Bane", STUDIO: "Studio", HJEM: "Hjem", SIMULATOR: "Simulator", GYM: "Gym" }[env]
      : null;
    const metaParts = [`${s.durationMin} m`];
    if (s._count.drills > 0) metaParts.push(`${s._count.drills} drills`);
    if (loc) metaParts.push(loc);
    return {
      id: s.id,
      dow,
      startMin,
      durMin: s.durationMin,
      time: hhmm(start),
      tone: PYR_TONE[s.pyramidArea],
      axisLabel: PYR_SHORT[s.pyramidArea],
      title: s.title,
      meta: metaParts.join(" · "),
      done: SESSION_DONE.includes(s.status),
      skipped: SESSION_SKIPPED.includes(s.status),
    };
  });

  // ── Dag-headere for uka ─────────────────────────────────────
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      dow: DOW[i],
      date: d.getDate(),
      monthLabel: d.getDate() === 1 || i === 0 ? MND_SHORT[d.getMonth()] : null,
      isToday: d.toDateString() === now.toDateString(),
      isWeekend: i >= 5,
    };
  });

  // ── Sesong-tre (uker fra aktiv plan) ────────────────────────
  const treeWeeks: WBTreeWeek[] = [];
  let seasonLabel = "Ingen aktiv sesong";
  let seasonWeeks = 0;
  if (activePlan) {
    const start = mondayOf(activePlan.startDate);
    const end = activePlan.endDate ? new Date(activePlan.endDate) : weekEnd;
    seasonWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 86_400_000)));
    seasonLabel = `${activePlan.name}`;
    const nowWeek = isoWeek(now);
    // Vis et vindu på ±2 uker rundt nå, innenfor planens spenn.
    const windowStart = new Date(weekStart);
    windowStart.setDate(windowStart.getDate() - 14);
    const windowEnd = new Date(weekStart);
    windowEnd.setDate(windowEnd.getDate() + 21);
    const seen = new Set<number>();
    for (let d = new Date(windowStart); d < windowEnd; d.setDate(d.getDate() + 7)) {
      if (d < start || d > end) continue;
      const wk = isoWeek(d);
      if (seen.has(wk)) continue;
      seen.add(wk);
      treeWeeks.push({ week: wk, isNow: wk === nowWeek });
    }
  }

  // ── Planer A/B ──────────────────────────────────────────────
  const planRows: WBPlanRow[] = plans.slice(0, 5).map((p) => ({
    id: p.id,
    name: p.name,
    status: PLAN_STATUS_LABEL[p.status],
    active: p.isActive,
  }));

  // ── Standardøkter (distinkte titler fra siste 30 d) ─────────
  const stdMap = new Map<string, WBStandardSession>();
  for (const s of weekSessions) {
    if (stdMap.has(s.title)) continue;
    stdMap.set(s.title, {
      id: s.id,
      name: s.title,
      tone: PYR_TONE[s.pyramidArea],
      durMin: s.durationMin,
      drillCount: s._count.drills,
    });
    if (stdMap.size >= 6) break;
  }
  const standardSessions = Array.from(stdMap.values());

  // ── Mål ─────────────────────────────────────────────────────
  const goalRows: WBGoalRow[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    meta: g.category === "PROCESS" ? "PROSESSMÅL" : "RESULTATMÅL",
    tone: g.type === "SG_AREA" ? "spill" : g.type === "HCP_TARGET" ? "tek" : "fys",
  }));

  // ── Pyramide / minutter per akse (siste 30 d) ───────────────
  const minByArea = new Map<PyramidArea, number>();
  const prevByArea = new Map<PyramidArea, number>();
  for (const s of last30Sessions) {
    minByArea.set(s.pyramidArea, (minByArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  }
  for (const s of prev30Sessions) {
    prevByArea.set(s.pyramidArea, (prevByArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  }
  const totalMin = last30Sessions.reduce((sum, s) => sum + s.durationMin, 0);
  // Top-down rekkefølge: TURN øverst → FYS nederst (pyramide-konvensjon).
  const pyramidRows: WBPyramidRow[] = [...PYR_REKKEFOLGE]
    .reverse()
    .map((area) => {
      const mins = minByArea.get(area) ?? 0;
      const prevMins = prevByArea.get(area) ?? 0;
      const pct = totalMin > 0 ? Math.round((mins / totalMin) * 100) : 0;
      const deltaMin = mins - prevMins;
      return {
        label: PYR_SHORT[area],
        tone: PYR_TONE[area],
        pct,
        hours: Math.round((mins / 60) * 10) / 10,
        deltaMin,
      };
    });

  // Fullføringsgrad uka — avvik fra plan.
  const weekTotal = weekSessions.length;
  const weekDone = weekSessions.filter((s) => SESSION_DONE.includes(s.status)).length;
  const weekSkipped = weekSessions.filter((s) => SESSION_SKIPPED.includes(s.status)).length;
  const weekElapsed = weekSessions.filter(
    (s) => s.scheduledAt < now && !SESSION_DONE.includes(s.status) && !SESSION_SKIPPED.includes(s.status),
  ).length;
  const deviationPct =
    weekTotal > 0 ? Math.round(((weekTotal - weekDone) / weekTotal) * 100) : null;

  // ── COACH-handlinger: ønsker veiledning ─────────────────────
  const guidance = sessionReqs.map((r) => ({
    id: r.id,
    reason: r.reason || "Ønsker økt",
    area: r.preferredArea ? PYR_SHORT[r.preferredArea] : null,
    when: `${r.createdAt.getDate()}. ${MND_SHORT[r.createdAt.getMonth()]}`,
  }));

  // ── COACH-ONLY: pending agent-forslag (kun coach ser dette) ─
  const coachOnlyActions = pendingActions.map((a) => ({
    id: a.id,
    actionType: a.actionType,
    agentName: a.agentName,
    when: `${a.createdAt.getDate()}. ${MND_SHORT[a.createdAt.getMonth()]}`,
  }));

  const age = calcAge(player.dateOfBirth);
  const metaBits = [
    tierLabel(player.tier),
    age != null ? `${age} år` : null,
    `HCP ${formatHcp(player.hcp)}`,
    player.homeClub,
  ].filter(Boolean) as string[];

  return {
    playerId: player.id,
    playerName: player.name,
    playerInitials: initials(player.name),
    playerAvatarUrl: player.avatarUrl,
    playerMeta: metaBits.join(" · "),
    nowLabel: hhmm(now),
    nowMin: now.getHours() * 60 + now.getMinutes(),
    weekNumber: isoWeek(now),
    weekRangeLabel: `${weekStart.getDate()}. ${MND_SHORT[weekStart.getMonth()]} – ${days[6].date}. ${MND_SHORT[(new Date(weekEnd.getTime() - 86_400_000)).getMonth()]}`,
    days,
    weekGrid,
    seasonLabel,
    seasonWeeks,
    treeWeeks,
    planRows,
    standardSessions,
    goalRows,
    pyramidRows,
    pyramidAlarm: buildAlarm(pyramidRows),
    activePlan: activePlan
      ? {
          id: activePlan.id,
          name: activePlan.name,
          status: activePlan.status,
          statusLabel: PLAN_STATUS_LABEL[activePlan.status],
          weekNumber: isoWeek(now),
        }
      : null,
    deviation: {
      pct: deviationPct,
      total: weekTotal,
      done: weekDone,
      skipped: weekSkipped,
      elapsedMissed: weekElapsed,
    },
    guidance,
    coachOnlyActions,
  };
}

/** Bygg en kort ubalanse-varsel-tekst hvis en akse taper SG/får lite tid. */
function buildAlarm(rows: WBPyramidRow[]): string | null {
  // Finn akse med størst negativt delta (mest redusert tid).
  const worst = [...rows].sort((a, b) => a.deltaMin - b.deltaMin)[0];
  if (!worst || worst.deltaMin >= 0) return null;
  const timer = worst.hours.toString().replace(".", ",");
  return `Mindre ${worst.label}-tid siste 30 d (${timer} t, ${worst.deltaMin} min vs forrige periode).`;
}
