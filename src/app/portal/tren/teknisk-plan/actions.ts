"use server";

/**
 * Server actions for Teknisk plan.
 * Eier sin egen authz — alle actions verifiserer at brukeren har tilgang
 * til planen (enten som spiller, opprettet-av eller coach/admin).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type {
  PyramidArea,
  LFase,
  CSNivaa,
  MMiljo,
  PRPress,
  TaskKategori,
  TmGoalType,
  TmGoalComparison,
  TmGoalProtocol,
} from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { nonEmpty } from "@/lib/validation/schemas";
import { applyPositionTaskReps } from "@/lib/teknisk-plan/apply-reps";
import { ensurePlanAccess } from "@/lib/teknisk-plan/ensure-plan-access";
import { pHovedNummer, pNavn, omraadeVisning } from "@/components/teknisk-plan/constants";
import {
  OMRAADE_KODER,
  MOTORIKK_KODER,
  BELASTNING_KODER,
  PRESS_KODER,
  MAALEUTSTYR_KODER,
  DIMENSJON_KODER,
  type OmraadeKode,
  type MotorikkKode,
  type BelastningKode,
  type PressKode,
  type MaaleutstyrKode,
  type DimensjonKode,
} from "@/lib/domain/ak-formel-v2";
import { vaskMotRelevans } from "@/lib/domain/omrade-relevans";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";

const PNummerSchema = z
  .string()
  .regex(/^P\d{1,2}\.\d$/, "Posisjonsnummer må være på formen P4.0 eller P4.1")
  .refine((v) => pHovedNummer(v) !== null, "Posisjonsnummer må være P1 til P10");

const TaskInputSchema = z.object({
  planId: z.string().min(1, "Plan-ID er påkrevd"),
  pNummer: PNummerSchema,
  pName: z.string().min(1, "Posisjonsnavn er påkrevd"),
  tittel: nonEmpty(500),
  beskrivelse: z.string().max(2000).optional(),
  pyramide: z.string().min(1, "Pyramide-område er påkrevd"),
  omraade: z.string().min(1, "Område er påkrevd"),
  omraadeKode: z.enum(OMRAADE_KODER).optional(),
  motorikk: z.enum(MOTORIKK_KODER).nullish(),
  belastning: z.enum(BELASTNING_KODER).nullish(),
  press: z.enum(PRESS_KODER).nullish(),
  dimensjon: z.enum(DIMENSJON_KODER).nullish(),
  maaleutstyr: z.enum(MAALEUTSTYR_KODER).nullish(),
  koller: z.array(z.string()),
  repsMaalDry: z.number().int().min(0),
  repsMaalLav: z.number().int().min(0),
  repsMaalFull: z.number().int().min(0),
  bildeUrl: z.string().max(2000).nullish(),
  videoUrl: z.string().max(2000).nullish(),
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
  /** Typet område. Når satt, utledes `omraade`-etiketten fra koden. */
  omraadeKode?: OmraadeKode | null;
  /** v2-akser (22.09). Vaskes mot relevansmatrisen før lagring. */
  motorikk?: MotorikkKode | null;
  belastning?: BelastningKode | null;
  press?: PressKode | null;
  dimensjon?: DimensjonKode | null;
  maaleutstyr?: MaaleutstyrKode | null;
  koller: string[];
  /**
   * Utgått (beslutning 21.09): L-fase, CS, Miljø og Press. Beholdes i typen så
   * eldre kallere ikke brekker, men skrives ikke lenger — se `vasketeAkser`.
   */
  lFase?: LFase | null;
  cs?: CSNivaa | null;
  miljo?: MMiljo | null;
  prPress?: PRPress | null;
  kategori?: TaskKategori | null;
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  bildeUrl?: string | null;
  videoUrl?: string | null;
  tmGoals?: TmGoalInput[];
  hitRateGoals?: HitRateGoalInput[];
}

// Navnet utledes alltid fra fasitlista (pNavn) — klientens pName er bare visning.
async function findOrCreatePosition(planId: string, pNummer: string, _pName: string) {
  const existing = await prisma.technicalPlanPosition.findFirst({
    where: { planId, pNummer },
  });
  if (existing) return existing;
  const navn = pNavn(pNummer);

  const lastSort = await prisma.technicalPlanPosition.findFirst({
    where: { planId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.technicalPlanPosition.create({
    data: {
      planId,
      pNummer,
      navn,
      sortOrder: (lastSort?.sortOrder ?? -1) + 1,
    },
  });
}

/**
 * Akser som ikke gjelder området lagres aldri (relevansmatrisen er et
 * visningsfilter — men et skjult felt skal heller ikke smugles inn via API-et).
 * Måleutstyr gjelder alle områder og vaskes ikke.
 */
function vasketeAkser(input: {
  omraadeKode?: OmraadeKode | null;
  motorikk?: MotorikkKode | null;
  belastning?: BelastningKode | null;
  press?: PressKode | null;
  dimensjon?: DimensjonKode | null;
}) {
  if (!input.omraadeKode) {
    return {
      motorikk: input.motorikk ?? null,
      belastning: input.belastning ?? null,
      press: input.press ?? null,
      dimensjon: input.dimensjon ?? null,
    };
  }
  const vasket = vaskMotRelevans({
    omraade: input.omraadeKode,
    motorikk: input.motorikk ?? null,
    belastning: input.belastning ?? null,
    press: input.press ?? null,
    dimensjon: input.dimensjon ?? null,
    sandTrinn: null,
  });
  return {
    motorikk: vasket.motorikk,
    belastning: vasket.belastning,
    press: vasket.press,
    dimensjon: vasket.dimensjon,
  };
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
      bildeUrl: input.bildeUrl ?? null,
      videoUrl: input.videoUrl ?? null,
      pyramide: input.pyramide,
      omraade: input.omraadeKode ? omraadeVisning(input.omraadeKode) : input.omraade,
      omraadeKode: input.omraadeKode ?? null,
      ...vasketeAkser(input),
      maaleutstyr: input.maaleutstyr ?? null,
      koller: input.koller,
      kategori: input.kategori ?? null,
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
  patch: Partial<Omit<TaskInput, "planId" | "tmGoals" | "hitRateGoals">>,
) {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: { position: { select: { planId: true, pNummer: true } } },
  });
  if (!task) throw new Error("Oppgave ikke funnet");
  const { user } = await ensurePlanAccess(task.position.planId);

  // Flytt til annen P-posisjon (også mellomposisjon) når pNummer er endret.
  let nyPositionId: string | undefined;
  let nySortOrder: number | undefined;
  if (patch.pNummer && patch.pNummer !== task.position.pNummer) {
    PNummerSchema.parse(patch.pNummer);
    const pos = await findOrCreatePosition(task.position.planId, patch.pNummer, patch.pName ?? "");
    const last = await prisma.positionTask.findFirst({
      where: { positionId: pos.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    nyPositionId = pos.id;
    nySortOrder = (last?.sortOrder ?? -1) + 1;
  }

  const updated = await prisma.positionTask.update({
    where: { id: taskId },
    data: {
      positionId: nyPositionId,
      sortOrder: nySortOrder,
      tittel: patch.tittel,
      beskrivelse: patch.beskrivelse,
      bildeUrl: patch.bildeUrl !== undefined ? patch.bildeUrl : undefined,
      videoUrl: patch.videoUrl !== undefined ? patch.videoUrl : undefined,
      pyramide: patch.pyramide,
      omraade: patch.omraadeKode ? omraadeVisning(patch.omraadeKode) : patch.omraade,
      omraadeKode: patch.omraadeKode ?? undefined,
      ...vasketeAkser({ ...patch, omraadeKode: patch.omraadeKode ?? task.omraadeKode }),
      maaleutstyr: patch.maaleutstyr ?? null,
      koller: patch.koller,
      kategori: patch.kategori ?? null,
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

  await applyPositionTaskReps(taskId, reps, user.id);

  revalidatePath(`/portal/tren/teknisk-plan/${task.position.planId}`);
  return { ok: true };
}

/**
 * Starter en pågående live-økt direkte fra en teknisk oppgave.
 * Kobler øvelsen til oppgaven via `positionTaskId` slik at reps som logges
 * i økta (eller snakkes inn via Whisper) automatisk oppdaterer teknisk plan.
 */
export async function startLiveSessionForTask(taskId: string) {
  IdSchema.parse(taskId);
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: {
      position: {
        select: {
          planId: true,
          pNummer: true,
          plan: { select: { userId: true } },
        },
      },
    },
  });
  if (!task) throw new Error("Oppgave ikke funnet");
  const { user } = await ensurePlanAccess(task.position.planId);

  const coachId = await resolveCoachIdForPlayer(task.position.plan.userId);

  const now = new Date();
  const endTime = new Date(now.getTime() + 45 * 60 * 1000);

  const session = await prisma.trainingSessionV2.create({
    data: {
      title: `Teknisk: ${task.position.pNummer} ${task.tittel}`,
      studentId: task.position.plan.userId,
      coachId,
      status: "IN_PROGRESS",
      startTime: now,
      endTime,
      miljo: "M1",
      practiceType: "BLOKK",
      isCoachCreated: user.id === coachId,
      drills: {
        create: [
          {
            name: task.tittel,
            pyramide: task.pyramide,
            positionTaskId: task.id,
            sortOrder: 0,
            durationMinutes: 30,
            planRepsUtenBall: task.repsMaalDry > 0 ? task.repsMaalDry : null,
            planRepsLavFart: task.repsMaalLav > 0 ? task.repsMaalLav : null,
            planRepsAuto: task.repsMaalFull > 0 ? task.repsMaalFull : null,
          },
        ],
      },
    },
  });

  revalidatePath(`/portal/tren/teknisk-plan/${task.position.planId}`);
  revalidatePath("/portal/live");

  return { ok: true, sessionId: session.id, url: `/portal/live/${session.id}/active` };
}
