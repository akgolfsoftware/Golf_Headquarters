"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import {
  IsoDateSchema,
  PhysicalExerciseLogSchema,
  TournamentRoundSchema,
  WorkbenchPlanStatusSchema,
} from "@/lib/workbench/fys-turnering-kontrakt";

const MAX_BLOCK_WEEKS = 12;

const CreatePhysicalBlockSchema = z.object({
  playerId: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  startDate: IsoDateSchema,
  endDate: IsoDateSchema,
  focus: z.string().trim().max(160).nullable().optional(),
});

const CreateTournamentPlanSchema = z.object({
  playerId: z.string().min(1),
  tournamentEntryId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(2).max(120),
  startDate: IsoDateSchema,
  endDate: IsoDateSchema,
  travelStartDate: IsoDateSchema.nullable().optional(),
  travelEndDate: IsoDateSchema.nullable().optional(),
  focus: z.enum(["TRENING", "UTVIKLING", "PRESTASJON"]).default("UTVIKLING"),
});

const IdSchema = z.object({ id: z.string().min(1) });

const CreatePhysicalSessionSchema = z.object({
  blockId: z.string().min(1),
  weekId: z.string().min(1),
  date: IsoDateSchema,
  title: z.string().trim().min(2).max(120),
  type: z.enum(["STYRKE", "KONDISJON", "MOBILITET", "TEST"]).default("STYRKE"),
  durationMinutes: z.number().int().min(5).max(240).nullable().optional(),
  exerciseTitle: z.string().trim().max(120).nullable().optional(),
});

const MovePhysicalSessionSchema = z.object({
  sessionId: z.string().min(1),
  date: IsoDateSchema,
});

const LogPhysicalSetSchema = PhysicalExerciseLogSchema.extend({
  exerciseId: z.string().min(1),
  note: z.string().trim().max(500).nullable().optional(),
});

const SaveTournamentRoundSchema = TournamentRoundSchema.extend({
  planId: z.string().min(1),
  roundId: z.string().min(1).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateDays(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  const start = toDate(startIso);
  const end = toDate(endIso);
  for (let d = new Date(start); d <= end && days.length < MAX_BLOCK_WEEKS * 7; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(isoDate(d));
  }
  return days;
}

function weekStarts(startIso: string, endIso: string): string[] {
  const start = toDate(startIso);
  const day = start.getUTCDay() === 0 ? 6 : start.getUTCDay() - 1;
  start.setUTCDate(start.getUTCDate() - day);
  const end = toDate(endIso);
  const starts: string[] = [];
  for (let d = new Date(start); d <= end && starts.length < MAX_BLOCK_WEEKS; d.setUTCDate(d.getUTCDate() + 7)) {
    starts.push(isoDate(d));
  }
  return starts;
}

function statusAfterPublish(status: string) {
  const parsed = WorkbenchPlanStatusSchema.safeParse(status);
  if (!parsed.success) return "PUBLISHED";
  return parsed.data === "PUBLISHED" ? "PUBLISHED" : "PUBLISHED";
}

function statusAfterCoachEdit(status: string) {
  return status === "PUBLISHED" ? "CHANGED_AFTER_PUBLISH" : status;
}

function revalidateWorkbench(playerId: string) {
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath(`/admin/workbench/${playerId}`);
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
}

async function requireCoachAccess(playerId: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!(await harCoachTilgangTilSpiller(user, playerId))) {
    return { ok: false as const, error: "Du har ikke tilgang til denne spilleren." };
  }
  return { ok: true as const, user };
}

export async function opprettFysiskBlokk(input: unknown): Promise<{ ok: boolean; blockId?: string; error?: string }> {
  const parsed = CreatePhysicalBlockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige felt i fysisk plan." };

  const tilgang = await requireCoachAccess(parsed.data.playerId);
  if (!tilgang.ok) return tilgang;

  const start = toDate(parsed.data.startDate);
  const end = toDate(parsed.data.endDate);
  if (end < start) return { ok: false, error: "Sluttdato må være etter startdato." };

  const weeks = weekStarts(parsed.data.startDate, parsed.data.endDate);
  const block = await prisma.workbenchPhysicalBlock.create({
    data: {
      playerId: parsed.data.playerId,
      coachId: tilgang.user.id,
      title: parsed.data.title,
      startDate: start,
      endDate: end,
      focus: parsed.data.focus ?? null,
      createdBy: tilgang.user.id,
      weeks: {
        create: weeks.map((weekStart, index) => ({
          weekIndex: index + 1,
          weekStart: toDate(weekStart),
          label: `Uke ${index + 1}`,
        })),
      },
    },
    select: { id: true },
  });

  revalidateWorkbench(parsed.data.playerId);
  return { ok: true, blockId: block.id };
}

export async function publiserFysiskBlokk(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig blokk." };

  const block = await prisma.workbenchPhysicalBlock.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, playerId: true, status: true },
  });
  if (!block) return { ok: false, error: "Fant ikke fysisk blokk." };

  const tilgang = await requireCoachAccess(block.playerId);
  if (!tilgang.ok) return tilgang;

  await prisma.workbenchPhysicalBlock.update({
    where: { id: block.id },
    data: { status: statusAfterPublish(block.status), publishedAt: new Date(), publishedBy: tilgang.user.id },
  });

  revalidateWorkbench(block.playerId);
  return { ok: true };
}

export async function opprettFysiskOkt(input: unknown): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const parsed = CreatePhysicalSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige felt i fysisk økt." };

  const week = await prisma.workbenchPhysicalWeek.findUnique({
    where: { id: parsed.data.weekId },
    select: {
      id: true,
      blockId: true,
      block: { select: { id: true, playerId: true, status: true } },
      _count: { select: { sessions: true } },
    },
  });
  if (!week || week.blockId !== parsed.data.blockId) return { ok: false, error: "Fant ikke uka i fysisk blokk." };

  const tilgang = await requireCoachAccess(week.block.playerId);
  if (!tilgang.ok) return tilgang;

  const session = await prisma.workbenchPhysicalSession.create({
    data: {
      weekId: week.id,
      playerId: week.block.playerId,
      date: toDate(parsed.data.date),
      title: parsed.data.title,
      type: parsed.data.type,
      durationMinutes: parsed.data.durationMinutes ?? null,
      sortOrder: week._count.sessions + 1,
      exercises: parsed.data.exerciseTitle
        ? {
            create: {
              title: parsed.data.exerciseTitle,
              sortOrder: 1,
            },
          }
        : undefined,
    },
    select: { id: true },
  });

  await prisma.workbenchPhysicalBlock.update({
    where: { id: week.block.id },
    data: { status: statusAfterCoachEdit(week.block.status) },
  });

  revalidateWorkbench(week.block.playerId);
  return { ok: true, sessionId: session.id };
}

export async function flyttFysiskOkt(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = MovePhysicalSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig flytting." };

  const session = await prisma.workbenchPhysicalSession.findUnique({
    where: { id: parsed.data.sessionId },
    select: {
      id: true,
      playerId: true,
      week: {
        select: {
          block: {
            select: {
              id: true,
              playerId: true,
              status: true,
              weeks: { select: { id: true, weekStart: true }, orderBy: { weekStart: "asc" } },
            },
          },
        },
      },
    },
  });
  if (!session) return { ok: false, error: "Fant ikke fysisk økt." };

  const tilgang = await requireCoachAccess(session.playerId);
  if (!tilgang.ok) return tilgang;

  const target = toDate(parsed.data.date);
  const targetMs = target.getTime();
  const targetWeek = session.week.block.weeks.find((week) => {
    const start = week.weekStart.getTime();
    const end = start + 7 * 86_400_000;
    return targetMs >= start && targetMs < end;
  });
  if (!targetWeek) return { ok: false, error: "Datoen ligger utenfor den fysiske blokken." };

  await prisma.workbenchPhysicalSession.update({
    where: { id: session.id },
    data: { date: target, weekId: targetWeek.id },
  });
  await prisma.workbenchPhysicalBlock.update({
    where: { id: session.week.block.id },
    data: { status: statusAfterCoachEdit(session.week.block.status) },
  });

  revalidateWorkbench(session.playerId);
  return { ok: true };
}

export async function loggFysiskSett(input: unknown): Promise<{ ok: boolean; logId?: string; error?: string }> {
  const parsed = LogPhysicalSetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig sett-logg." };

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const exercise = await prisma.workbenchPhysicalExercise.findUnique({
    where: { id: parsed.data.exerciseId },
    select: {
      id: true,
      session: {
        select: {
          id: true,
          playerId: true,
          durationMinutes: true,
          perceivedEffort: true,
          exercises: { select: { logs: { select: { reps: true, weightKg: true } } } },
        },
      },
    },
  });
  if (!exercise) return { ok: false, error: "Fant ikke øvelsen." };
  if (user.role === "PLAYER" && exercise.session.playerId !== user.id) return { ok: false, error: "Ikke tillatt." };
  if (user.role !== "PLAYER" && !(await harCoachTilgangTilSpiller(user, exercise.session.playerId))) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }

  const log = await prisma.workbenchPhysicalLog.create({
    data: {
      exerciseId: exercise.id,
      playerId: exercise.session.playerId,
      setNumber: parsed.data.setNumber,
      reps: parsed.data.reps ?? null,
      weightKg: parsed.data.weightKg ?? null,
      rir: parsed.data.rir ?? null,
      note: parsed.data.note ?? null,
    },
    select: { id: true },
  });

  revalidateWorkbench(exercise.session.playerId);
  return { ok: true, logId: log.id };
}

export async function opprettTurneringsplan(input: unknown): Promise<{ ok: boolean; planId?: string; error?: string }> {
  const parsed = CreateTournamentPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige felt i turneringsplan." };

  const tilgang = await requireCoachAccess(parsed.data.playerId);
  if (!tilgang.ok) return tilgang;

  const start = toDate(parsed.data.startDate);
  const end = toDate(parsed.data.endDate);
  if (end < start) return { ok: false, error: "Sluttdato må være etter startdato." };
  if (parsed.data.travelStartDate && parsed.data.travelEndDate && toDate(parsed.data.travelEndDate) < toDate(parsed.data.travelStartDate)) {
    return { ok: false, error: "Reiseslutt må være etter reisestart." };
  }

  const roundDays = dateDays(parsed.data.startDate, parsed.data.endDate).slice(0, 8);
  const plan = await prisma.workbenchTournamentPlan.create({
    data: {
      playerId: parsed.data.playerId,
      coachId: tilgang.user.id,
      tournamentEntryId: parsed.data.tournamentEntryId ?? null,
      title: parsed.data.title,
      startDate: start,
      endDate: end,
      travelStartDate: parsed.data.travelStartDate ? toDate(parsed.data.travelStartDate) : null,
      travelEndDate: parsed.data.travelEndDate ? toDate(parsed.data.travelEndDate) : null,
      focus: parsed.data.focus,
      createdBy: tilgang.user.id,
      preparations: {
        create: [
          { date: start, title: "Banebok og strategi", category: "PLAN", sortOrder: 1 },
          { date: start, title: "Oppvarming og start-rutine", category: "RUTINE", sortOrder: 2 },
        ],
      },
      rounds: {
        create: roundDays.map((date, index) => ({
          roundNumber: index + 1,
          date: toDate(date),
        })),
      },
    },
    select: { id: true },
  });

  revalidateWorkbench(parsed.data.playerId);
  return { ok: true, planId: plan.id };
}

export async function publiserTurneringsplan(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig turneringsplan." };

  const plan = await prisma.workbenchTournamentPlan.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, playerId: true, status: true },
  });
  if (!plan) return { ok: false, error: "Fant ikke turneringsplan." };

  const tilgang = await requireCoachAccess(plan.playerId);
  if (!tilgang.ok) return tilgang;

  await prisma.workbenchTournamentPlan.update({
    where: { id: plan.id },
    data: { status: statusAfterPublish(plan.status), publishedAt: new Date(), publishedBy: tilgang.user.id },
  });

  revalidateWorkbench(plan.playerId);
  return { ok: true };
}

export async function lagreTurneringsrunde(input: unknown): Promise<{ ok: boolean; roundId?: string; error?: string }> {
  const parsed = SaveTournamentRoundSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldige runde-felt." };

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const plan = await prisma.workbenchTournamentPlan.findUnique({
    where: { id: parsed.data.planId },
    select: { id: true, playerId: true },
  });
  if (!plan) return { ok: false, error: "Fant ikke turneringsplanen." };
  if (user.role === "PLAYER" && plan.playerId !== user.id) return { ok: false, error: "Ikke tillatt." };
  if (user.role !== "PLAYER" && !(await harCoachTilgangTilSpiller(user, plan.playerId))) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }

  const data = {
    roundNumber: parsed.data.roundNumber,
    date: toDate(parsed.data.date),
    teeTimeMinutes: parsed.data.teeTimeMinutes ?? null,
    grossScore: parsed.data.grossScore ?? null,
    strokesGained: parsed.data.strokesGained ?? null,
    source: parsed.data.source ?? null,
    sourceDate: parsed.data.sourceDate ? new Date(parsed.data.sourceDate) : null,
    notes: parsed.data.notes ?? null,
  };

  const round = parsed.data.roundId
    ? await prisma.workbenchTournamentRound.update({ where: { id: parsed.data.roundId }, data, select: { id: true } })
    : await prisma.workbenchTournamentRound.upsert({
        where: { planId_roundNumber: { planId: plan.id, roundNumber: parsed.data.roundNumber } },
        update: data,
        create: { ...data, planId: plan.id },
        select: { id: true },
      });

  revalidateWorkbench(plan.playerId);
  return { ok: true, roundId: round.id };
}
