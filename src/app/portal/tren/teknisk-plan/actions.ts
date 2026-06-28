"use server";

/**
 * Server actions for Teknisk plan.
 * Eier sin egen authz — alle actions verifiserer at brukeren har tilgang
 * til planen (enten som spiller, opprettet-av eller coach/admin).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertNotAwaitingConsent } from "@/lib/auth/requireConsentingUser";
import type {
  PyramidArea,
  LFase,
  CSNivaa,
  MMiljo,
  PRPress,
  TmGoalType,
  TmGoalComparison,
  TmGoalProtocol,
  RepHastighet,
} from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { nonEmpty } from "@/lib/validation/schemas";

const TaskInputSchema = z.object({
  planId: z.string().min(1, "Plan-ID er påkrevd"),
  pNummer: z.string().min(1, "Posisjonsnummer er påkrevd"),
  pName: z.string().min(1, "Posisjonsnavn er påkrevd"),
  tittel: nonEmpty(500),
  beskrivelse: z.string().max(2000).optional(),
  pyramide: z.string().min(1, "Pyramide-område er påkrevd"),
  omraade: z.string().min(1, "Område er påkrevd"),
  koller: z.array(z.string()),
  repsMaalDry: z.number().int().min(0),
  repsMaalLav: z.number().int().min(0),
  repsMaalFull: z.number().int().min(0),
});

const IdSchema = z.string().min(1, "ID er påkrevd");
const LogRepsSchema = z.object({
  taskId: z.string().min(1, "Oppgave-ID er påkrevd"),
  reps: z.object({
    dry: z.number().int().min(0).optional(),
    lav: z.number().int().min(0).optional(),
    full: z.number().int().min(0).optional(),
  }),
});

interface TmGoalInput {
  metric: string;
  klubb: string;
  baselineValue: number;
  targetValue: number;
  targetType: TmGoalType;
  comparison: TmGoalComparison;
  rangeMax?: number | null;
}

interface HitRateGoalInput {
  metric: string;
  klubb: string;
  protocol: TmGoalProtocol;
  windowSize: number;
  requiredHits: number;
  corridorMin: number;
  corridorMax: number;
}

export interface TaskInput {
  planId: string;
  pNummer: string;
  pName: string;
  tittel: string;
  beskrivelse?: string;
  pyramide: PyramidArea;
  omraade: string;
  koller: string[];
  lFase?: LFase | null;
  cs?: CSNivaa | null;
  miljo?: MMiljo | null;
  prPress?: PRPress | null;
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  tmGoals?: TmGoalInput[];
  hitRateGoals?: HitRateGoalInput[];
}

async function ensurePlanAccess(planId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");
  assertNotAwaitingConsent(user);
  const plan = await prisma.technicalPlan.findUnique({
    where: { id: planId },
    select: { userId: true, opprettetAvId: true },
  });
  if (!plan) throw new Error("Plan ikke funnet");
  const isOwner = plan.userId === user.id || plan.opprettetAvId === user.id;
  const isCoachOrAdmin = user.role === "COACH" || user.role === "ADMIN";
  if (!isOwner && !isCoachOrAdmin) throw new Error("Ingen tilgang");
  return { user, plan };
}

async function findOrCreatePosition(planId: string, pNummer: string, pName: string) {
  const existing = await prisma.technicalPlanPosition.findFirst({
    where: { planId, pNummer },
  });
  if (existing) return existing;

  const lastSort = await prisma.technicalPlanPosition.findFirst({
    where: { planId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.technicalPlanPosition.create({
    data: {
      planId,
      pNummer,
      navn: pName,
      sortOrder: (lastSort?.sortOrder ?? -1) + 1,
    },
  });
}

export async function createTask(input: TaskInput) {
  TaskInputSchema.parse(input);
  const { user } = await ensurePlanAccess(input.planId);
  const position = await findOrCreatePosition(input.planId, input.pNummer, input.pName);

  const lastSort = await prisma.positionTask.findFirst({
    where: { positionId: position.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const task = await prisma.positionTask.create({
    data: {
      positionId: position.id,
      sortOrder: (lastSort?.sortOrder ?? -1) + 1,
      tittel: input.tittel,
      beskrivelse: input.beskrivelse,
      pyramide: input.pyramide,
      omraade: input.omraade,
      koller: input.koller,
      lFase: input.lFase ?? null,
      cs: input.cs ?? null,
      miljo: input.miljo ?? null,
      prPress: input.prPress ?? null,
      repsMaalDry: input.repsMaalDry,
      repsMaalLav: input.repsMaalLav,
      repsMaalFull: input.repsMaalFull,
      tmGoals: input.tmGoals?.length
        ? {
            create: input.tmGoals.map((g) => ({
              metric: g.metric,
              klubb: g.klubb,
              baselineValue: g.baselineValue,
              baselineFrom: "manual",
              baselineDate: new Date(),
              targetValue: g.targetValue,
              targetType: g.targetType,
              comparison: g.comparison,
              rangeMax: g.rangeMax,
            })),
          }
        : undefined,
    },
  });

  // Hit-rate-mål må lages separat så vi kan sette HIT_RATE-spesifikke felt
  if (input.hitRateGoals?.length) {
    for (const g of input.hitRateGoals) {
      await prisma.positionTaskTmGoal.create({
        data: {
          taskId: task.id,
          metric: g.metric,
          klubb: g.klubb,
          baselineValue: 0,
          baselineFrom: "manual",
          baselineDate: new Date(),
          targetValue: g.requiredHits,
          targetType: "HIT_RATE",
          comparison: "GREATER_THAN",
          protocol: g.protocol,
          windowSize: g.windowSize,
          requiredHits: g.requiredHits,
          corridorMin: g.corridorMin,
          corridorMax: g.corridorMax,
        },
      });
    }
  }

  await prisma.technicalPlanAudit.create({
    data: {
      planId: input.planId,
      actorId: user.id,
      action: "TASK_ADD",
      target: task.id,
      payload: { tittel: input.tittel, pNummer: input.pNummer },
    },
  });

  revalidatePath(`/portal/tren/teknisk-plan/${input.planId}`);
  return { ok: true, taskId: task.id };
}

export async function updateTaskBasics(
  taskId: string,
  patch: Partial<Omit<TaskInput, "planId" | "pNummer" | "pName" | "tmGoals" | "hitRateGoals">>,
) {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: { position: { select: { planId: true } } },
  });
  if (!task) throw new Error("Oppgave ikke funnet");
  const { user } = await ensurePlanAccess(task.position.planId);

  const updated = await prisma.positionTask.update({
    where: { id: taskId },
    data: {
      tittel: patch.tittel,
      beskrivelse: patch.beskrivelse,
      pyramide: patch.pyramide,
      omraade: patch.omraade,
      koller: patch.koller,
      lFase: patch.lFase ?? null,
      cs: patch.cs ?? null,
      miljo: patch.miljo ?? null,
      prPress: patch.prPress ?? null,
      repsMaalDry: patch.repsMaalDry,
      repsMaalLav: patch.repsMaalLav,
      repsMaalFull: patch.repsMaalFull,
    },
  });

  await prisma.technicalPlanAudit.create({
    data: {
      planId: task.position.planId,
      actorId: user.id,
      action: "TASK_EDIT",
      target: taskId,
      payload: patch as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/portal/tren/teknisk-plan/${task.position.planId}`);
  return { ok: true, task: updated };
}

export async function deleteTask(taskId: string) {
  IdSchema.parse(taskId);
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: { position: { select: { planId: true } } },
  });
  if (!task) throw new Error("Oppgave ikke funnet");
  const { user } = await ensurePlanAccess(task.position.planId);

  await prisma.positionTask.delete({ where: { id: taskId } });

  await prisma.technicalPlanAudit.create({
    data: {
      planId: task.position.planId,
      actorId: user.id,
      action: "TASK_DELETE",
      target: taskId,
    },
  });

  revalidatePath(`/portal/tren/teknisk-plan/${task.position.planId}`);
  return { ok: true };
}

export async function reorderPositions(planId: string, orderedIds: string[]) {
  IdSchema.parse(planId);
  z.array(z.string().min(1)).parse(orderedIds);
  const { user } = await ensurePlanAccess(planId);
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.technicalPlanPosition.update({
        where: { id },
        data: { sortOrder: i },
      }),
    ),
  );
  await prisma.technicalPlanAudit.create({
    data: {
      planId,
      actorId: user.id,
      action: "PRIO_CHANGE",
      payload: { type: "positions", orderedIds },
    },
  });
  revalidatePath(`/portal/tren/teknisk-plan/${planId}`);
  return { ok: true };
}

export async function reorderTasks(positionId: string, orderedIds: string[]) {
  IdSchema.parse(positionId);
  z.array(z.string().min(1)).parse(orderedIds);
  const position = await prisma.technicalPlanPosition.findUnique({
    where: { id: positionId },
    select: { planId: true },
  });
  if (!position) throw new Error("Posisjon ikke funnet");
  const { user } = await ensurePlanAccess(position.planId);
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.positionTask.update({
        where: { id },
        data: { sortOrder: i },
      }),
    ),
  );
  await prisma.technicalPlanAudit.create({
    data: {
      planId: position.planId,
      actorId: user.id,
      action: "PRIO_CHANGE",
      payload: { type: "tasks", positionId, orderedIds },
    },
  });
  revalidatePath(`/portal/tren/teknisk-plan/${position.planId}`);
  return { ok: true };
}

export async function logReps(
  taskId: string,
  reps: { dry?: number; lav?: number; full?: number },
) {
  LogRepsSchema.parse({ taskId, reps });
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: { position: { select: { planId: true } } },
  });
  if (!task) throw new Error("Oppgave ikke funnet");
  const { user } = await ensurePlanAccess(task.position.planId);

  await prisma.positionTask.update({
    where: { id: taskId },
    data: {
      repsGjortDry: { increment: reps.dry ?? 0 },
      repsGjortLav: { increment: reps.lav ?? 0 },
      repsGjortFull: { increment: reps.full ?? 0 },
    },
  });

  const logRows: { hastighet: RepHastighet; reps: number }[] = (
    [
      { hastighet: "DRY", reps: reps.dry ?? 0 },
      { hastighet: "LAV", reps: reps.lav ?? 0 },
      { hastighet: "FULL", reps: reps.full ?? 0 },
    ] as { hastighet: RepHastighet; reps: number }[]
  ).filter((r) => r.reps > 0);

  if (logRows.length > 0) {
    await prisma.positionTaskLog.createMany({
      data: logRows.map((r) => ({
        taskId,
        loggedByUserId: user.id,
        reps: r.reps,
        hastighet: r.hastighet,
      })),
    });
  }

  revalidatePath(`/portal/tren/teknisk-plan/${task.position.planId}`);
  return { ok: true };
}
