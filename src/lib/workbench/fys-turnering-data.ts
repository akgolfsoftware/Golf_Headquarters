import "server-only";

import { prisma } from "@/lib/prisma";
import {
  calculateExerciseTonnage,
  calculateSessionLoad,
  type WorkbenchPlanStatus,
} from "@/lib/workbench/fys-turnering-kontrakt";

const PLAYER_VISIBLE_STATUSES = ["PUBLISHED", "CHANGED_AFTER_PUBLISH", "WITHDRAWN"] as const;

export type WorkbenchPlanConflictDto = {
  id: string;
  date: string | null;
  type: string;
  severity: string;
  title: string;
  details: string | null;
  resolutionStatus: string;
};

export type WorkbenchPhysicalExerciseDto = {
  id: string;
  title: string;
  setsTarget: number | null;
  repsMin: number | null;
  repsMax: number | null;
  weightKg: number | null;
  rirTarget: number | null;
  actualTonnageKg: number;
  logs: {
    id: string;
    setNumber: number;
    reps: number | null;
    weightKg: number | null;
    rir: number | null;
    completedAt: string;
  }[];
};

export type WorkbenchPhysicalSessionDto = {
  id: string;
  date: string;
  startMinute: number | null;
  durationMinutes: number | null;
  title: string;
  status: string;
  type: string;
  location: string | null;
  plannedLoad: number | null;
  actualLoad: number | null;
  perceivedEffort: number | null;
  readiness: number | null;
  playerNote: string | null;
  calculatedLoad: number | null;
  actualTonnageKg: number;
  exercises: WorkbenchPhysicalExerciseDto[];
};

export type WorkbenchPhysicalWeekDto = {
  id: string;
  weekIndex: number;
  weekStart: string;
  label: string;
  plannedMinutes: number | null;
  targetTonnageKg: number | null;
  actualTonnageKg: number | null;
  sessions: WorkbenchPhysicalSessionDto[];
};

export type WorkbenchPhysicalBlockDto = {
  id: string;
  title: string;
  status: WorkbenchPlanStatus | string;
  periodKind: string;
  startDate: string;
  endDate: string;
  focus: string | null;
  notes: string | null;
  publishedAt: string | null;
  changedAfterPublish: boolean;
  weeks: WorkbenchPhysicalWeekDto[];
  conflicts: WorkbenchPlanConflictDto[];
};

export type WorkbenchTournamentPlanDto = {
  id: string;
  tournamentEntryId: string | null;
  title: string;
  status: WorkbenchPlanStatus | string;
  focus: string;
  format: string | null;
  startDate: string;
  endDate: string;
  travelStartDate: string | null;
  travelEndDate: string | null;
  notes: string | null;
  publishedAt: string | null;
  preparations: {
    id: string;
    date: string;
    title: string;
    category: string;
    completedAt: string | null;
    notes: string | null;
  }[];
  rounds: {
    id: string;
    roundNumber: number;
    date: string;
    teeTimeMinutes: number | null;
    startHole: string | null;
    routine: string | null;
    gamePlan: string | null;
    grossScore: number | null;
    strokesGained: number | null;
    source: string | null;
    sourceDate: string | null;
    notes: string | null;
  }[];
  goals: {
    id: string;
    kind: string;
    title: string;
    targetValue: number | null;
    unit: string | null;
  }[];
  latestEvaluation: {
    id: string;
    grossTotal: number | null;
    sgTotal: number | null;
    source: string | null;
    sourceDate: string | null;
    summary: string | null;
    learnings: string | null;
    nextAction: string | null;
  } | null;
  conflicts: WorkbenchPlanConflictDto[];
};

export type WorkbenchFysTurneringData = {
  physicalBlocks: WorkbenchPhysicalBlockDto[];
  tournamentPlans: WorkbenchTournamentPlanDto[];
  openConflicts: WorkbenchPlanConflictDto[];
  /** false når de valgfrie modultabellene ennå ikke er etablert i databasen. */
  available?: boolean;
};

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

function isoDateTime(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

function visibleWhere(viewer?: "player" | "coach") {
  return viewer === "player" ? { status: { in: [...PLAYER_VISIBLE_STATUSES] } } : {};
}

export async function loadFysTurneringWorkbenchData(
  playerId: string,
  opts?: { viewer?: "player" | "coach" },
): Promise<WorkbenchFysTurneringData> {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 45);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 210);

  // Disse modulene ble lagt til etter hoved-Workbench. Enkelte miljøer har
  // derfor ennå ikke tabellene. Sjekk dem uten å utløse tre Prisma-feil i
  // serverloggen; selve Workbench skal fortsatt kunne åpnes.
  const [tables] = await prisma.$queryRaw<Array<{
    physical: string | null;
    tournament: string | null;
    conflicts: string | null;
  }>>`
    SELECT
      to_regclass('public.workbench_physical_blocks')::text AS physical,
      to_regclass('public.workbench_tournament_plans')::text AS tournament,
      to_regclass('public.workbench_plan_conflicts')::text AS conflicts
  `;
  if (!tables?.physical || !tables.tournament || !tables.conflicts) {
    return { physicalBlocks: [], tournamentPlans: [], openConflicts: [], available: false };
  }

  const loadRows = () => Promise.all([
    prisma.workbenchPhysicalBlock.findMany({
      where: {
        playerId,
        endDate: { gte: windowStart },
        startDate: { lte: windowEnd },
        ...visibleWhere(opts?.viewer),
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
      take: 8,
      include: {
        weeks: {
          orderBy: { weekIndex: "asc" },
          include: {
            sessions: {
              orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
              include: {
                exercises: {
                  orderBy: { sortOrder: "asc" },
                  include: { logs: { orderBy: { setNumber: "asc" } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.workbenchTournamentPlan.findMany({
      where: {
        playerId,
        endDate: { gte: windowStart },
        startDate: { lte: windowEnd },
        ...visibleWhere(opts?.viewer),
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
      take: 12,
      include: {
        preparations: {
          where: opts?.viewer === "player" ? { playerVisible: true } : undefined,
          orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
        },
        rounds: { orderBy: { roundNumber: "asc" } },
        goals: { orderBy: { sortOrder: "asc" } },
        evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
        conflicts: { orderBy: [{ resolutionStatus: "asc" }, { createdAt: "desc" }] },
      },
    }),
    prisma.workbenchPlanConflict.findMany({
      where: { playerId, resolutionStatus: "OPEN" },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 12,
    }),
  ]);

  let rows: Awaited<ReturnType<typeof loadRows>>;
  try {
    rows = await loadRows();
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2021") {
      return { physicalBlocks: [], tournamentPlans: [], openConflicts: [], available: false };
    }
    throw error;
  }
  const [physicalBlocks, tournamentPlans, openConflicts] = rows;

  const conflictDtos = openConflicts.map(mapConflict);

  return {
    available: true,
    physicalBlocks: physicalBlocks.map((block) => {
      const conflicts = conflictDtos.filter((c) =>
        openConflicts.some((raw) => raw.id === c.id && raw.physicalBlockId === block.id),
      );
      return {
        id: block.id,
        title: block.title,
        status: block.status,
        periodKind: block.periodKind,
        startDate: isoDate(block.startDate) ?? "",
        endDate: isoDate(block.endDate) ?? "",
        focus: block.focus,
        notes: block.notes,
        publishedAt: isoDateTime(block.publishedAt),
        changedAfterPublish: Boolean(block.publishedAt && block.status === "CHANGED_AFTER_PUBLISH"),
        conflicts,
        weeks: block.weeks.map((week) => ({
          id: week.id,
          weekIndex: week.weekIndex,
          weekStart: isoDate(week.weekStart) ?? "",
          label: week.label,
          plannedMinutes: week.plannedMinutes,
          targetTonnageKg: week.targetTonnageKg,
          actualTonnageKg: week.actualTonnageKg,
          sessions: week.sessions.map((session) => {
            const exercises = session.exercises.map((exercise) => {
              const logs = exercise.logs.map((log) => ({
                id: log.id,
                setNumber: log.setNumber,
                reps: log.reps,
                weightKg: log.weightKg,
                rir: log.rir,
                completedAt: log.completedAt.toISOString(),
              }));
              return {
                id: exercise.id,
                title: exercise.title,
                setsTarget: exercise.setsTarget,
                repsMin: exercise.repsMin,
                repsMax: exercise.repsMax,
                weightKg: exercise.weightKg,
                rirTarget: exercise.rirTarget,
                actualTonnageKg: calculateExerciseTonnage(logs),
                logs,
              };
            });
            return {
              id: session.id,
              date: isoDate(session.date) ?? "",
              startMinute: session.startMinute,
              durationMinutes: session.durationMinutes,
              title: session.title,
              status: session.status,
              type: session.type,
              location: session.location,
              plannedLoad: session.plannedLoad,
              actualLoad: session.actualLoad,
              perceivedEffort: session.perceivedEffort,
              readiness: session.readiness,
              playerNote: session.playerNote,
              calculatedLoad: calculateSessionLoad(session),
              actualTonnageKg: exercises.reduce((sum, exercise) => sum + exercise.actualTonnageKg, 0),
              exercises,
            };
          }),
        })),
      };
    }),
    tournamentPlans: tournamentPlans.map((plan) => ({
      id: plan.id,
      tournamentEntryId: plan.tournamentEntryId,
      title: plan.title,
      status: plan.status,
      focus: plan.focus,
      format: plan.format,
      startDate: isoDate(plan.startDate) ?? "",
      endDate: isoDate(plan.endDate) ?? "",
      travelStartDate: isoDate(plan.travelStartDate),
      travelEndDate: isoDate(plan.travelEndDate),
      notes: plan.notes,
      publishedAt: isoDateTime(plan.publishedAt),
      preparations: plan.preparations.map((prep) => ({
        id: prep.id,
        date: isoDate(prep.date) ?? "",
        title: prep.title,
        category: prep.category,
        completedAt: isoDateTime(prep.completedAt),
        notes: prep.notes,
      })),
      rounds: plan.rounds.map((round) => ({
        id: round.id,
        roundNumber: round.roundNumber,
        date: isoDate(round.date) ?? "",
        teeTimeMinutes: round.teeTimeMinutes,
        startHole: round.startHole,
        routine: round.routine,
        gamePlan: round.gamePlan,
        grossScore: round.grossScore,
        strokesGained: round.strokesGained,
        source: round.source,
        sourceDate: isoDateTime(round.sourceDate),
        notes: round.notes,
      })),
      goals: plan.goals.map((goal) => ({
        id: goal.id,
        kind: goal.kind,
        title: goal.title,
        targetValue: goal.targetValue,
        unit: goal.unit,
      })),
      latestEvaluation: plan.evaluations[0]
        ? {
            id: plan.evaluations[0].id,
            grossTotal: plan.evaluations[0].grossTotal,
            sgTotal: plan.evaluations[0].sgTotal,
            source: plan.evaluations[0].source,
            sourceDate: isoDateTime(plan.evaluations[0].sourceDate),
            summary: plan.evaluations[0].summary,
            learnings: plan.evaluations[0].learnings,
            nextAction: plan.evaluations[0].nextAction,
          }
        : null,
      conflicts: plan.conflicts.map(mapConflict),
    })),
    openConflicts: conflictDtos,
  };
}

function mapConflict(conflict: {
  id: string;
  date: Date | null;
  type: string;
  severity: string;
  title: string;
  details: string | null;
  resolutionStatus: string;
}): WorkbenchPlanConflictDto {
  return {
    id: conflict.id,
    date: isoDate(conflict.date),
    type: conflict.type,
    severity: conflict.severity,
    title: conflict.title,
    details: conflict.details,
    resolutionStatus: conflict.resolutionStatus,
  };
}
