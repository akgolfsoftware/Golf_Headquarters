import { z } from "zod";
import type {
  LPhase,
  PyramidArea,
  SgCategory,
  SkillArea,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PYR_LABEL } from "@/lib/pyramide";
import {
  runDrillSelectionSkill,
  runJuniorGuardSkill,
  runPeriodizationSkill,
  SG_TO_PYRAMID,
  SG_TO_SKILL,
} from "@/lib/training/skills";

const pyramidAdjustSchema = z.object({
  omrade: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  omradeNavn: z.string().optional(),
  faktiskProsent: z.number().optional(),
  malProsent: z.number().optional(),
  forklaring: z.string().optional(),
});

const trainingGapSchema = z.object({
  svakestOmraade: z.enum(["OTT", "APP", "ARG", "PUTT"]),
  svakestLabel: z.string().optional(),
  snittSg: z.number().optional(),
  andelTrening: z.number().optional(),
  forklaring: z.string().optional(),
});

const drillSwapSchema = z.object({
  sessionId: z.string(),
  exerciseId: z.string(),
  forklaring: z.string().optional(),
});

const focusChangeSchema = z.object({
  skillArea: z.enum([
    "TEE_TOTAL",
    "TILNAERMING",
    "AROUND_GREEN",
    "PUTTING",
    "SPILL",
  ]),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]).optional(),
  forklaring: z.string().optional(),
});

const sessionAddSchema = z.object({
  title: z.string(),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  skillArea: z
    .enum(["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"])
    .optional(),
  durationMin: z.number().int().positive().default(60),
  scheduledAt: z.string().datetime().optional(),
});

const sessionRemoveSchema = z.object({
  sessionId: z.string(),
});

const weekShiftSchema = z.object({
  uker: z.number().int().positive().default(1),
});

const intensityAdjustSchema = z.object({
  csTarget: z.number().int().min(50).max(100),
  sessionIds: z.array(z.string()).optional(),
});

const periodSwitchSchema = z.object({
  periodType: z.enum(["GRUNN", "SPES", "TURN", "HVILE", "OVERGANG"]),
  forklaring: z.string().optional(),
});

const restDaySchema = z.object({
  date: z.string().optional(),
  forklaring: z.string().optional(),
});

export type PlanSessionSnapshot = {
  id: string;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  scheduledAt: Date;
  status: string;
  durationMin: number;
  title: string;
};

export type ExecutorDelta = {
  sessionsToAdd: Array<{
    title: string;
    pyramidArea: PyramidArea;
    skillArea: SkillArea | null;
    durationMin: number;
    scheduledAt: Date;
    drillExerciseIds: string[];
  }>;
  sessionsToRemove: string[];
  sessionsToModify: Array<{
    sessionId: string;
    skillArea?: SkillArea;
    pyramidArea?: PyramidArea;
    csTarget?: number;
    scheduledAt?: Date;
    replaceDrillExerciseId?: string;
  }>;
  planMeta?: {
    periodNote?: string;
  };
  summary: string;
};

export type PlanContext = {
  planId: string;
  userId: string;
  futureSessions: PlanSessionSnapshot[];
  planlagteOkterNesteUke: number;
};

function nesteLedigeSlot(
  sessions: PlanSessionSnapshot[],
  fra = new Date(),
): Date {
  const start = new Date(fra);
  start.setHours(17, 0, 0, 0);
  if (start < fra) {
    start.setDate(start.getDate() + 1);
  }
  const opptatt = new Set(
    sessions.map((s) => s.scheduledAt.toISOString().slice(0, 10)),
  );
  const candidate = new Date(start);
  for (let i = 0; i < 14; i++) {
    const key = candidate.toISOString().slice(0, 10);
    if (!opptatt.has(key)) return candidate;
    candidate.setDate(candidate.getDate() + 1);
  }
  return start;
}

export function computeDelta(
  actionType: string,
  suggestion: unknown,
  ctx: PlanContext,
): ExecutorDelta {
  const empty: ExecutorDelta = {
    sessionsToAdd: [],
    sessionsToRemove: [],
    sessionsToModify: [],
    summary: "Ingen endring",
  };

  switch (actionType) {
    case "PYRAMID_ADJUST": {
      const s = pyramidAdjustSchema.parse(suggestion);
      const slot = nesteLedigeSlot(ctx.futureSessions);
      return {
        sessionsToAdd: [
          {
            title: `Fokus ${PYR_LABEL[s.omrade]}`,
            pyramidArea: s.omrade,
            skillArea: null,
            durationMin: 60,
            scheduledAt: slot,
            drillExerciseIds: [],
          },
        ],
        sessionsToRemove: [],
        sessionsToModify: [],
        summary: s.forklaring ?? `Legger til ${PYR_LABEL[s.omrade]}-økt`,
      };
    }
    case "TRAINING_GAP": {
      const s = trainingGapSchema.parse(suggestion);
      const skillArea = SG_TO_SKILL[s.svakestOmraade as SgCategory];
      const pyramidArea = SG_TO_PYRAMID[s.svakestOmraade as SgCategory];
      const slot = nesteLedigeSlot(ctx.futureSessions);
      return {
        sessionsToAdd: [
          {
            title: `Gap-trening: ${s.svakestLabel ?? skillArea}`,
            pyramidArea,
            skillArea,
            durationMin: 75,
            scheduledAt: slot,
            drillExerciseIds: [],
          },
        ],
        sessionsToRemove: [],
        sessionsToModify: [],
        summary:
          s.forklaring ??
          `Øker fokus på ${s.svakestOmraade} etter treningsgap-analyse`,
      };
    }
    case "FOCUS_CHANGE": {
      const s = focusChangeSchema.parse(suggestion);
      const pyramidArea = s.pyramidArea ?? "SLAG";
      const slot = nesteLedigeSlot(ctx.futureSessions);
      return {
        sessionsToAdd: [
          {
            title: `Fokusendring: ${s.skillArea}`,
            pyramidArea,
            skillArea: s.skillArea,
            durationMin: 60,
            scheduledAt: slot,
            drillExerciseIds: [],
          },
        ],
        sessionsToRemove: [],
        sessionsToModify: [],
        summary: s.forklaring ?? `Nytt fokus: ${s.skillArea}`,
      };
    }
    case "DRILL_SWAP": {
      const s = drillSwapSchema.parse(suggestion);
      return {
        sessionsToAdd: [],
        sessionsToRemove: [],
        sessionsToModify: [
          {
            sessionId: s.sessionId,
            replaceDrillExerciseId: s.exerciseId,
          },
        ],
        summary: s.forklaring ?? "Bytter drill i planlagt økt",
      };
    }
    case "SESSION_ADD": {
      const s = sessionAddSchema.parse(suggestion);
      const slot = s.scheduledAt
        ? new Date(s.scheduledAt)
        : nesteLedigeSlot(ctx.futureSessions);
      return {
        sessionsToAdd: [
          {
            title: s.title,
            pyramidArea: s.pyramidArea,
            skillArea: s.skillArea ?? null,
            durationMin: s.durationMin,
            scheduledAt: slot,
            drillExerciseIds: [],
          },
        ],
        sessionsToRemove: [],
        sessionsToModify: [],
        summary: `Legger til økt: ${s.title}`,
      };
    }
    case "SESSION_REMOVE": {
      const s = sessionRemoveSchema.parse(suggestion);
      return {
        sessionsToAdd: [],
        sessionsToRemove: [s.sessionId],
        sessionsToModify: [],
        summary: "Fjerner planlagt økt",
      };
    }
    case "WEEK_SHIFT": {
      const s = weekShiftSchema.parse(suggestion);
      const dager = s.uker * 7;
      const mods = ctx.futureSessions
        .filter((x) => x.status === "PLANNED")
        .map((x) => ({
          sessionId: x.id,
          scheduledAt: new Date(x.scheduledAt.getTime() + dager * 86400000),
        }));
      return {
        sessionsToAdd: [],
        sessionsToRemove: [],
        sessionsToModify: mods,
        summary: `Forskyver planlagte økter ${s.uker} uke(r)`,
      };
    }
    case "INTENSITY_ADJUST": {
      const s = intensityAdjustSchema.parse(suggestion);
      const ids =
        s.sessionIds ??
        ctx.futureSessions
          .filter((x) => x.status === "PLANNED")
          .slice(0, 3)
          .map((x) => x.id);
      return {
        sessionsToAdd: [],
        sessionsToRemove: [],
        sessionsToModify: ids.map((sessionId) => ({
          sessionId,
          csTarget: s.csTarget,
        })),
        summary: `Justerer CS-mål til ${s.csTarget}`,
      };
    }
    case "PERIOD_SWITCH": {
      const s = periodSwitchSchema.parse(suggestion);
      return {
        sessionsToAdd: [],
        sessionsToRemove: [],
        sessionsToModify: [],
        planMeta: { periodNote: s.periodType },
        summary:
          s.forklaring ?? `Bytter til ${s.periodType}-modus i planleggingen`,
      };
    }
    case "REST_DAY_ADD": {
      const s = restDaySchema.parse(suggestion);
      const dag = s.date ? new Date(s.date) : nesteLedigeSlot(ctx.futureSessions);
      const konflikt = ctx.futureSessions.find(
        (x) =>
          x.status === "PLANNED" &&
          x.scheduledAt.toISOString().slice(0, 10) ===
            dag.toISOString().slice(0, 10),
      );
      return {
        sessionsToAdd: [],
        sessionsToRemove: konflikt ? [konflikt.id] : [],
        sessionsToModify: [],
        summary: s.forklaring ?? "Legger inn hviledag (fjerner planlagt økt)",
      };
    }
    default:
      return empty;
  }
}

async function loadPlanContext(
  userId: string,
  planId: string | null,
): Promise<PlanContext> {
  const plan =
    planId != null
      ? await prisma.trainingPlan.findUnique({ where: { id: planId } })
      : await prisma.trainingPlan.findFirst({
          where: { userId, isActive: true },
          orderBy: { updatedAt: "desc" },
        });

  if (!plan) {
    throw new Error("ingen-aktiv-plan");
  }

  const now = new Date();
  const ukeSlutt = new Date(now);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const sessions = await prisma.trainingPlanSession.findMany({
    where: {
      planId: plan.id,
      scheduledAt: { gte: now },
      status: { in: ["PLANNED", "ACTIVE", "PAUSED"] },
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      pyramidArea: true,
      skillArea: true,
      scheduledAt: true,
      status: true,
      durationMin: true,
      title: true,
    },
  });

  const planlagteOkterNesteUke = sessions.filter(
    (s) => s.scheduledAt <= ukeSlutt && s.status === "PLANNED",
  ).length;

  return {
    planId: plan.id,
    userId,
    futureSessions: sessions,
    planlagteOkterNesteUke,
  };
}

async function resolveDrillsForSession(
  skillArea: SkillArea | null,
  _userId: string,
): Promise<string[]> {
  if (!skillArea) return [];
  const drills = await prisma.exerciseDefinition.findMany({
    where: { skillArea, source: "SYSTEM" },
    take: 10,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      skillArea: true,
      lPhases: true,
      csTargetByKategori: true,
      durationMin: true,
    },
  });
  const { valgte } = runDrillSelectionSkill({
    skillArea,
    sisteDrillIds: [],
    kandidater: drills.map((d) => ({
      id: d.id,
      name: d.name,
      skillArea: d.skillArea,
      lPhases: (d.lPhases ?? []).map(String),
      csTargetByKategori:
        d.csTargetByKategori && typeof d.csTargetByKategori === "object"
          ? (d.csTargetByKategori as Record<string, number>)
          : null,
      varighetMin: d.durationMin,
    })),
    maxDrills: 2,
    varighetMin: 60,
  });
  return valgte.map((v) => v.id);
}

export async function applyExecutorDelta(
  delta: ExecutorDelta,
  ctx: PlanContext,
): Promise<{ sessionsAdded: number; sessionsRemoved: number; sessionsModified: number }> {
  let sessionsAdded = 0;
  let sessionsRemoved = 0;
  let sessionsModified = 0;

  await prisma.$transaction(async (tx) => {
    for (const id of delta.sessionsToRemove) {
      const s = await tx.trainingPlanSession.findFirst({
        where: { id, planId: ctx.planId, status: "PLANNED" },
      });
      if (s) {
        await tx.trainingPlanSession.delete({ where: { id } });
        sessionsRemoved++;
      }
    }

    for (const mod of delta.sessionsToModify) {
      const s = await tx.trainingPlanSession.findFirst({
        where: {
          id: mod.sessionId,
          planId: ctx.planId,
          status: "PLANNED",
        },
        include: { drills: true },
      });
      if (!s) continue;

      await tx.trainingPlanSession.update({
        where: { id: mod.sessionId },
        data: {
          ...(mod.skillArea ? { skillArea: mod.skillArea } : {}),
          ...(mod.pyramidArea ? { pyramidArea: mod.pyramidArea } : {}),
          ...(mod.scheduledAt ? { scheduledAt: mod.scheduledAt } : {}),
        },
      });

      if (mod.replaceDrillExerciseId) {
        const first = s.drills[0];
        if (first) {
          await tx.sessionDrill.update({
            where: { id: first.id },
            data: {
              exerciseId: mod.replaceDrillExerciseId,
              csTarget: mod.csTarget ?? first.csTarget,
            },
          });
        } else {
          await tx.sessionDrill.create({
            data: {
              sessionId: mod.sessionId,
              exerciseId: mod.replaceDrillExerciseId,
              repsSets: "3x10",
              orderIndex: 0,
              csTarget: mod.csTarget ?? null,
            },
          });
        }
      } else if (mod.csTarget != null && s.drills[0]) {
        await tx.sessionDrill.update({
          where: { id: s.drills[0].id },
          data: { csTarget: mod.csTarget },
        });
      }
      sessionsModified++;
    }

    for (const add of delta.sessionsToAdd) {
      const drillIds =
        add.drillExerciseIds.length > 0
          ? add.drillExerciseIds
          : await resolveDrillsForSession(add.skillArea, ctx.userId);

      const session = await tx.trainingPlanSession.create({
        data: {
          planId: ctx.planId,
          title: add.title,
          scheduledAt: add.scheduledAt,
          durationMin: add.durationMin,
          pyramidArea: add.pyramidArea,
          skillArea: add.skillArea,
          status: "PLANNED",
          lPhase: "GRUNN" as LPhase,
          rationale: delta.summary,
        },
      });

      for (let i = 0; i < drillIds.length; i++) {
        await tx.sessionDrill.create({
          data: {
            sessionId: session.id,
            exerciseId: drillIds[i],
            repsSets: "3x10",
            orderIndex: i,
          },
        });
      }
      sessionsAdded++;
    }

    if (delta.planMeta?.periodNote) {
      await tx.trainingPlan.update({
        where: { id: ctx.planId },
        data: {
          aiPrompt: `period:${delta.planMeta.periodNote}`,
        },
      });
    }
  });

  return { sessionsAdded, sessionsRemoved, sessionsModified };
}

export type ExecuteResult = {
  applied: boolean;
  summary: string;
  sessionsAdded: number;
  sessionsRemoved: number;
  sessionsModified: number;
};

export async function executePlanAction(actionId: string): Promise<ExecuteResult> {
  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (action.status !== "PENDING") {
    return {
      applied: false,
      summary: "Allerede behandlet",
      sessionsAdded: 0,
      sessionsRemoved: 0,
      sessionsModified: 0,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: action.userId },
    select: { id: true, dateOfBirth: true },
  });
  if (!user) throw new Error("bruker-mangler");

  const ctx = await loadPlanContext(action.userId, action.planId);
  const delta = computeDelta(action.actionType, action.suggestion, ctx);

  const period = runPeriodizationSkill({
    ukeStart: new Date(),
    skadeAktiv: false,
    dagerTilTurnering:
      action.actionType === "PERIOD_SWITCH" ? 5 : null,
  });

  if (
    !period.tillatTekniskeEndringer &&
    (action.actionType === "SESSION_ADD" || action.actionType === "PYRAMID_ADJUST")
  ) {
    const sugg = action.suggestion as { omrade?: string } | null;
    if (sugg?.omrade === "TEK") {
      throw new Error("periodisering-blokkerer-tekniske-endringer");
    }
  }

  const guard = runJuniorGuardSkill({
    dateOfBirth: user.dateOfBirth,
    planlagteOkterNesteUke: ctx.planlagteOkterNesteUke,
    sessionsToAdd: delta.sessionsToAdd.length,
    csTarget: delta.sessionsToModify.find((m) => m.csTarget)?.csTarget,
  });
  if (!guard.tillatt) {
    throw new Error(guard.avslagGrunn ?? "junior-guard");
  }

  const result = await applyExecutorDelta(delta, ctx);

  await prisma.notification.create({
    data: {
      userId: action.userId,
      type: "plan_action_applied",
      title: "Plan oppdatert",
      body: delta.summary.slice(0, 280),
      link: "/portal/planlegge",
    },
  });

  return {
    applied: true,
    summary: delta.summary,
    ...result,
  };
}