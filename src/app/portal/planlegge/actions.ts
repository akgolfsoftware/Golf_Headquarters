"use server";

/**
 * Server actions for /portal/planlegge Workbench.
 * Henter og muterer planer, økter, drills, turneringer, mål og justeringer.
 */

import { dagensStartUTC } from "@/lib/dato";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { z } from "zod";
import type {
  Axis,
  PyramidArea,
  WorkbenchData,
  WorkbenchDrill,
  WorkbenchGoal,
  WorkbenchPlan,
  WorkbenchPyramidRow,
  WorkbenchSession,
  WorkbenchStandardSession,
  WorkbenchTournament,
} from "@/components/portal/workbench/types";

// ───────── Konstanter ─────────
const PYR_TONE: Record<PyramidArea, Axis> = {
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

// ───────── Hjelpefunksjoner ─────────
function mondayOf(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86_400_000));
}

// ───────── Hent Workbench-data ─────────
export async function getWorkbenchData(weekStartInput?: string): Promise<WorkbenchData> {
  const user = await requirePortalUser();

  const now = new Date();
  const weekStart = weekStartInput ? new Date(weekStartInput) : mondayOf(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [plans, weekSessions, drillMaler, goals, entries, pendingAdjustments] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: { userId: user.id },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true,
        startDate: true,
        endDate: true,
        _count: { select: { sessions: true } },
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: user.id }, scheduledAt: { gte: weekStart, lt: weekEnd } },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        planId: true,
        scheduledAt: true,
        durationMin: true,
        title: true,
        pyramidArea: true,
        environment: true,
        status: true,
        _count: { select: { drills: true } },
      },
    }),
    prisma.oktMal.findMany({
        where: { OR: [{ coachId: user.id }, { erGlobal: true }] },
        orderBy: [{ erFavoritt: "desc" }, { updatedAt: "desc" }],
        take: 20,
        select: {
          id: true,
          navn: true,
          durationMinutes: true,
          pyramide: true,
          _count: { select: { driller: true } },
        },
      }),
      prisma.goal.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, type: true, category: true },
      }),
      prisma.tournamentEntry.findMany({
        where: {
          userId: user.id,
          entryStatus: { in: ["PLANNED", "CONFIRMED"] },
          OR: [{ tournament: { startDate: { gte: dagensStartUTC(now) } } }, { manualDate: { gte: dagensStartUTC(now) } }],
        },
        orderBy: { createdAt: "asc" },
        take: 6,
        select: {
          id: true,
          manualName: true,
          manualDate: true,
          tournament: { select: { name: true, startDate: true, location: true } },
        },
      }),
      prisma.planAdjustment.count({
        where: { userId: user.id, status: "PENDING" },
      }),
    ]);

  const activePlan = plans.find((p) => p.isActive) ?? plans[0] ?? null;

  const mappedPlans: WorkbenchPlan[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    isActive: p.isActive,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate?.toISOString() ?? null,
    sessionCount: p._count.sessions,
  }));

  const mappedSessions: WorkbenchSession[] = weekSessions.map((s) => ({
    id: s.id,
    planId: s.planId,
    title: s.title,
    scheduledAt: s.scheduledAt.toISOString(),
    durationMin: s.durationMin,
    pyramidArea: s.pyramidArea,
    environment: s.environment ? ENV_LABEL[s.environment] ?? s.environment : null,
    status: s.status,
    drillCount: s._count.drills,
  }));

  const mappedStandardSessions: WorkbenchStandardSession[] = drillMaler.map((m) => ({
    id: m.id,
    name: m.navn,
    durationMinutes: m.durationMinutes,
    pyramidArea: m.pyramide,
    drillCount: m._count.driller,
  }));

  const mappedTournaments: WorkbenchTournament[] = entries
    .map((e) => {
      const name = e.tournament?.name ?? e.manualName ?? "Turnering";
      const date = e.tournament?.startDate ?? e.manualDate ?? null;
      const days = date ? Math.ceil((date.getTime() - now.getTime()) / 86_400_000) : null;
      return {
        id: e.id,
        name,
        date: date?.toISOString() ?? null,
        daysLeft: days != null ? Math.max(0, days) : null,
        soon: days != null && days <= 14,
      };
    })
    .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));

  const mappedGoals: WorkbenchGoal[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    type: g.type,
  }));

  const weekMinByArea = new Map<PyramidArea, number>();
  for (const s of weekSessions) {
    weekMinByArea.set(s.pyramidArea, (weekMinByArea.get(s.pyramidArea) ?? 0) + s.durationMin);
  }
  const axisHours: WorkbenchPyramidRow[] = (Object.keys(PYR_SHORT) as PyramidArea[]).map(
    (area) => ({
      ax: PYR_TONE[area],
      lbl: PYR_SHORT[area],
      hours: Math.round(((weekMinByArea.get(area) ?? 0) / 60) * 10) / 10,
    }),
  );

  const plannedMin = weekSessions.reduce((a, s) => a + s.durationMin, 0);

  return {
    weekNumber: isoWeek(now),
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    plans: mappedPlans,
    activePlanId: activePlan?.id ?? null,
    sessions: mappedSessions,
    standardSessions: mappedStandardSessions,
    tournaments: mappedTournaments,
    goals: mappedGoals,
    axisHours,
    summary: {
      sessionCount: weekSessions.length,
      plannedHours: Math.round((plannedMin / 60) * 10) / 10,
    },
    pendingAdjustments,
  };
}

// ───────── Hent drills for en økt ─────────
export async function getSessionDrills(sessionId: string): Promise<WorkbenchDrill[]> {
  const user = await requirePortalUser();

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { plan: { select: { userId: true } } },
  });
  if (!session || session.plan.userId !== user.id) return [];

  const drills = await prisma.sessionDrill.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
    select: {
      id: true,
      repsSets: true,
      exercise: { select: { name: true, pyramidArea: true, durationMin: true } },
    },
  });

  return drills.map((d) => ({
    id: d.id,
    name: d.exercise.name,
    pyramidArea: d.exercise.pyramidArea,
    durationMin: d.exercise.durationMin,
    repsSets: d.repsSets,
  }));
}

// ───────── Oppdater økt tid/dato ─────────
const updateSessionSchema = z.object({
  sessionId: z.string().min(1),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Ugyldig dato/tid"),
  durationMin: z.coerce.number().int().min(5).max(480),
});

export async function updateSessionTime(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await requirePortalUser();

  const raw = {
    sessionId: String(formData.get("sessionId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    durationMin: formData.get("durationMin"),
  };

  const parsed = updateSessionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig inndata" };
  }

  const { sessionId, scheduledAt, durationMin } = parsed.data;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { plan: { select: { userId: true } } },
  });
  if (!session || session.plan.userId !== user.id) {
    return { ok: false, error: "Økt ikke funnet" };
  }

  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { scheduledAt: new Date(scheduledAt), durationMin },
  });

  revalidatePath("/portal/planlegge");
  return { ok: true };
}

// ───────── Opprett ny økt ─────────
const createSessionSchema = z.object({
  planId: z.string().min(1),
  title: z.string().min(1, "Tittel er påkrevd").max(120),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Ugyldig dato/tid"),
  durationMin: z.coerce.number().int().min(5).max(480),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  environment: z
    .enum(["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"])
    .nullable()
    .optional(),
});

export async function createSession(formData: FormData): Promise<{
  ok: boolean;
  sessionId?: string;
  error?: string;
}> {
  const user = await requirePortalUser();

  const raw = {
    planId: String(formData.get("planId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    durationMin: formData.get("durationMin"),
    pyramidArea: String(formData.get("pyramidArea") ?? ""),
    environment: formData.get("environment") ? String(formData.get("environment")) : null,
  };

  const parsed = createSessionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig inndata" };
  }

  const { planId, title, scheduledAt, durationMin, pyramidArea, environment } = parsed.data;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { id: true, userId: true },
  });
  if (!plan || plan.userId !== user.id) {
    return { ok: false, error: "Plan ikke funnet" };
  }

  const session = await prisma.trainingPlanSession.create({
    data: {
      planId,
      title,
      scheduledAt: new Date(scheduledAt),
      durationMin,
      pyramidArea,
      environment: environment ?? null,
      status: "PLANNED",
    },
    select: { id: true },
  });

  revalidatePath("/portal/planlegge");
  return { ok: true, sessionId: session.id };
}

// ───────── Legg til standardøkt i kalender ─────────
const addStandardSessionSchema = z.object({
  malId: z.string().min(1),
  planId: z.string().min(1),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Ugyldig dato/tid"),
});

export async function addStandardSessionToCalendar(formData: FormData): Promise<{
  ok: boolean;
  sessionId?: string;
  error?: string;
}> {
  const user = await requirePortalUser();

  const raw = {
    malId: String(formData.get("malId") ?? ""),
    planId: String(formData.get("planId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
  };

  const parsed = addStandardSessionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig inndata" };
  }

  const { malId, planId, scheduledAt } = parsed.data;

  const [plan, mal] = await Promise.all([
    prisma.trainingPlan.findUnique({ where: { id: planId }, select: { userId: true } }),
    prisma.oktMal.findUnique({
      where: { id: malId },
      select: { navn: true, durationMinutes: true, pyramide: true, driller: true },
    }),
  ]);

  if (!plan || plan.userId !== user.id) {
    return { ok: false, error: "Plan ikke funnet" };
  }
  if (!mal) {
    return { ok: false, error: "Mal ikke funnet" };
  }

  // Finn matchende ExerciseDefinition-rader for malens driller (navn + pyramide).
  const exerciseIds: { exerciseId: string; orderIndex: number }[] = [];
  for (let i = 0; i < mal.driller.length; i++) {
    const d = mal.driller[i];
    const exercise = await prisma.exerciseDefinition.findFirst({
      where: { name: d.navn, pyramidArea: d.pyramide },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    if (exercise) {
      exerciseIds.push({ exerciseId: exercise.id, orderIndex: i });
    }
  }

  const session = await prisma.trainingPlanSession.create({
    data: {
      planId,
      title: mal.navn,
      scheduledAt: new Date(scheduledAt),
      durationMin: mal.durationMinutes,
      pyramidArea: mal.pyramide,
      status: "PLANNED",
      drills:
        exerciseIds.length > 0
          ? {
              create: exerciseIds.map((d) => ({
                exerciseId: d.exerciseId,
                repsSets: "Etter mal",
                orderIndex: d.orderIndex,
              })),
            }
          : undefined,
    },
    select: { id: true },
  });

  revalidatePath("/portal/planlegge");
  return { ok: true, sessionId: session.id };
}

// ───────── Sett aktiv plan (Plan A/B) ─────────
export async function setActivePlan(planId: string): Promise<{ ok: boolean }> {
  const user = await requirePortalUser();

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { id: true, userId: true },
  });
  if (!plan || plan.userId !== user.id) {
    return { ok: false };
  }

  await prisma.trainingPlan.updateMany({
    where: { userId: user.id },
    data: { isActive: false },
  });
  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { isActive: true },
  });

  revalidatePath("/portal/planlegge");
  return { ok: true };
}
