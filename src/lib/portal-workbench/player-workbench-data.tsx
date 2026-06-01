/**
 * Data-loader for PlayerHQ Workbench (/portal/planlegge/workbench).
 *
 * Spiller-versjon av den delte Workbench-kjernen. Speiler datamønsteret i
 * src/lib/admin-workbench/workbench-data.tsx (coach-versjonen), men:
 *   - henter den innloggede spillerens egne data (requirePortalUser, ingen playerId)
 *   - dropper coach-only-felter (plan-godkjenning, avvik, veiledning, agent-forslag)
 *   - shaper uke-øktene gruppert per ukedag for vertikal mobil-stack
 *
 * Ekte Prisma-data via TrainingPlan + TrainingPlanSession + Goal. Ingen falske
 * tall — mangler data → tomt eller utledet.
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import type { PyramidArea, PlanStatus, SessionStatus } from "@/generated/prisma/client";
import { PYR_REKKEFOLGE } from "@/lib/pyramide";
import type {
  PlayerWorkbenchData,
  WBP_DaySessions,
  WBP_Session,
  WBP_TreeWeek,
  WBP_PlanRow,
  WBP_StandardSession,
  WBP_GoalRow,
  WBP_PyramidRow,
} from "@/components/portal/workbench/player-workbench";

const DOW = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const DOW_LONG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const MND_SHORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

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

const ENV_LABEL: Record<string, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjem",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  DRAFT: "utkast",
  PENDING_PLAYER: "venter svar",
  ACCEPTED: "godtatt",
  REJECTED: "endring ønsket",
  ACTIVE: "aktiv",
  PAUSED: "pause",
  ARCHIVED: "arkiv",
};

const SESSION_DONE: SessionStatus[] = ["COMPLETED"];
const SESSION_SKIPPED: SessionStatus[] = ["SKIPPED", "CANCELLED"];

function formatDuration(min: number): string {
  if (min < 60) return `${min} m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} t` : `${h} t ${m} m`;
}

export async function loadPlayerWorkbench(): Promise<PlayerWorkbenchData> {
  const user = await requirePortalUser();
  const playerId = user.id;

  const now = new Date();
  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  const [plans, weekSessions, last30Sessions, goals] = await Promise.all([
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
      select: { pyramidArea: true, durationMin: true },
    }),
    prisma.goal.findMany({
      where: { userId: playerId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, type: true, category: true },
    }),
  ]);

  const activePlan = plans.find((p) => p.isActive) ?? plans[0] ?? null;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // ── Uke-økter mappet til UI-form ───────────────────────────────
  const sessions: WBP_Session[] = weekSessions.map((s) => {
    const start = s.scheduledAt;
    const dow = (start.getDay() + 6) % 7; // 0 = mandag
    const env = s.environment;
    const loc = env ? ENV_LABEL[env] ?? null : null;
    const metaParts = [formatDuration(s.durationMin)];
    if (s._count.drills > 0) metaParts.push(`${s._count.drills} drills`);
    metaParts.push(hhmm(start));
    if (loc) metaParts.push(loc);
    const isNow =
      dow === ((now.getDay() + 6) % 7) &&
      nowMin >= start.getHours() * 60 + start.getMinutes() &&
      nowMin < start.getHours() * 60 + start.getMinutes() + s.durationMin;
    return {
      id: s.id,
      dow,
      startMin: start.getHours() * 60 + start.getMinutes(),
      time: hhmm(start),
      tone: PYR_TONE[s.pyramidArea],
      axisLabel: PYR_SHORT[s.pyramidArea],
      title: s.title,
      meta: metaParts.join(" · "),
      durMin: s.durationMin,
      done: SESSION_DONE.includes(s.status),
      skipped: SESSION_SKIPPED.includes(s.status),
      live: isNow && !SESSION_DONE.includes(s.status) && !SESSION_SKIPPED.includes(s.status),
    };
  });

  // ── 7 dager med øktene sine (vertikal stack) ───────────────────
  const todayDow = (now.getDay() + 6) % 7;
  const days: WBP_DaySessions[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const daySessions = sessions
      .filter((s) => s.dow === i)
      .sort((a, b) => a.startMin - b.startMin);
    return {
      dow: DOW[i],
      dowLong: DOW_LONG[i],
      date: d.getDate(),
      monthLabel: MND_SHORT[d.getMonth()],
      isToday: i === todayDow,
      isWeekend: i >= 5,
      sessions: daySessions,
    };
  });

  // ── Sesong-tre (uker rundt nå innenfor aktiv plan) ─────────────
  const treeWeeks: WBP_TreeWeek[] = [];
  let seasonLabel = "Ingen aktiv sesong";
  let seasonWeeks = 0;
  if (activePlan) {
    const start = mondayOf(activePlan.startDate);
    const end = activePlan.endDate ? new Date(activePlan.endDate) : weekEnd;
    seasonWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 86_400_000)));
    seasonLabel = activePlan.name;
    const nowWeek = isoWeek(now);
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

  // ── Planer A/B ─────────────────────────────────────────────────
  const planRows: WBP_PlanRow[] = plans.slice(0, 5).map((p) => ({
    id: p.id,
    name: p.name,
    status: PLAN_STATUS_LABEL[p.status],
    active: p.isActive,
  }));

  // ── Standardøkter (distinkte titler fra uka) ───────────────────
  const stdMap = new Map<string, WBP_StandardSession>();
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

  // ── Mål ────────────────────────────────────────────────────────
  const goalRows: WBP_GoalRow[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    meta: g.category === "PROCESS" ? "PROSESSMÅL" : "RESULTATMÅL",
    tone: g.type === "SG_AREA" ? "spill" : g.type === "HCP_TARGET" ? "tek" : "fys",
  }));

  // ── Pyramide / minutter per akse (siste 30 d) ──────────────────
  const minByArea = new Map<PyramidArea, number>();
  for (const s of last30Sessions) {
    minByArea.set(s.pyramidArea, (minByArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  }
  const totalMin = last30Sessions.reduce((sum, s) => sum + s.durationMin, 0);
  // Top-down: TURN øverst → FYS nederst (pyramide-konvensjon).
  const pyramidRows: WBP_PyramidRow[] = [...PYR_REKKEFOLGE].reverse().map((area) => {
    const mins = minByArea.get(area) ?? 0;
    const pct = totalMin > 0 ? Math.round((mins / totalMin) * 100) : 0;
    return {
      label: PYR_SHORT[area],
      tone: PYR_TONE[area],
      pct,
      hours: Math.round((mins / 60) * 10) / 10,
    };
  });

  // Ukes-fremdrift (spillerens egen status).
  const weekTotal = sessions.length;
  const weekDone = sessions.filter((s) => s.done).length;

  const weekEndDate = new Date(weekEnd.getTime() - 86_400_000);

  return {
    playerFirstName: user.name?.trim().split(/\s+/)[0] ?? "Spiller",
    weekNumber: isoWeek(now),
    weekRangeLabel: `${weekStart.getDate()}. ${MND_SHORT[weekStart.getMonth()]} – ${weekEndDate.getDate()}. ${MND_SHORT[weekEndDate.getMonth()]}`,
    nowLabel: hhmm(now),
    days,
    weekTotalSessions: weekTotal,
    weekDoneSessions: weekDone,
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
        }
      : null,
  };
}

/** Kort ubalanse-varsel hvis en akse har minst tid siste 30 d (kun når det finnes data). */
function buildAlarm(rows: WBP_PyramidRow[]): string | null {
  if (rows.every((r) => r.pct === 0)) return null;
  const lowest = [...rows].sort((a, b) => a.pct - b.pct)[0];
  if (!lowest || lowest.pct >= 15) return null;
  const timer = lowest.hours.toString().replace(".", ",");
  return `Lite ${lowest.label}-tid siste 30 d (${timer} t, ${lowest.pct} %).`;
}
