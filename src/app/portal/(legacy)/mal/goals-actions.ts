"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { nonEmpty, isoDate } from "@/lib/validation/schemas";
import { SG_OMRADER, type SgOmrade } from "@/lib/domain/maal-fremdrift";
import { hentSgSnittPerOmrade } from "@/lib/portal/sg-omrade-snitt";

const GoalInputSchema = z.object({
  type: z.string().min(1, "Type er påkrevd"),
  title: nonEmpty(500),
  targetValue: z.number().nullable().optional(),
  targetDate: isoDate.nullable().optional(),
  sgOmrade: z.enum(SG_OMRADER).nullable().optional(),
});

const GoalIdSchema = z.string().min(1, "Mål-ID er påkrevd");
const AvbrytGoalSchema = z.object({
  goalId: z.string().min(1, "Mål-ID er påkrevd"),
  reason: z.string().max(1000).optional(),
});

export type GoalInput = {
  type: string;
  title: string;
  targetValue?: number | null;
  targetDate?: string | null;
  /** SG-område for SG_AREA-mål. Kreves for at fremdrift skal kunne måles. */
  sgOmrade?: SgOmrade | null;
};

/**
 * Bygger payload for et SG-mål: området + spillerens SG i området NÅ som
 * utgangspunkt («baseline»). SG har ikke noe naturlig nullpunkt — et mål kan
 * gå fra −1,5 til −0,5 — så reisen må måles fra der spilleren faktisk står
 * når området velges. Baselinen settes bare første gang (eller når området
 * byttes), ellers ville hver redigering nullstilt fremdriften.
 */
async function byggSgPayload(
  userId: string,
  eksisterende: Record<string, unknown>,
  sgOmrade: SgOmrade | null | undefined,
): Promise<Prisma.InputJsonObject> {
  // sgOmrade/sgStart bygges alltid på nytt under — alt annet i payloaden
  // (f.eks. abandonReason) skal bevares.
  const { sgOmrade: _gammeltOmrade, sgStart: _gammelStart, ...ovrig } = eksisterende;
  const rest = ovrig as Prisma.InputJsonObject;

  if (!sgOmrade) return rest;

  const uendretOmrade = eksisterende.sgOmrade === sgOmrade;
  const gammelStart = eksisterende.sgStart;
  if (uendretOmrade && typeof gammelStart === "number") {
    return { ...rest, sgOmrade, sgStart: gammelStart };
  }

  const snitt = await hentSgSnittPerOmrade(userId);
  const start = snitt[sgOmrade];
  // Ingen runder ennå → ingen ærlig baseline. Området lagres likevel, og
  // baselinen settes neste gang målet lagres etter at runder finnes.
  return start == null ? { ...rest, sgOmrade } : { ...rest, sgOmrade, sgStart: start };
}

export async function createGoal(input: GoalInput) {
  GoalInputSchema.parse(input);
  const user = await requireConsentingUser();
  if (!input.title.trim()) throw new Error("missing-title");

  const payload =
    input.type === "SG_AREA" ? await byggSgPayload(user.id, {}, input.sgOmrade) : null;

  await prisma.goal.create({
    data: {
      userId: user.id,
      type: input.type,
      title: input.title.trim(),
      targetValue: input.targetValue ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      ...(payload && Object.keys(payload).length > 0 ? { payload } : {}),
    },
  });

  revalidatePath("/portal/mal");
}

export async function markeerGoalSomOppnaadd(goalId: string) {
  GoalIdSchema.parse(goalId);
  const user = await requireConsentingUser();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  await prisma.goal.update({
    where: { id: goalId },
    data: { status: "ACHIEVED" },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}

export async function slettGoal(goalId: string) {
  GoalIdSchema.parse(goalId);
  const user = await requireConsentingUser();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  await prisma.goal.delete({ where: { id: goalId } });
  revalidatePath("/portal/mal");
  redirect("/portal/mal");
}

/**
 * Avbryt et mål — markerer det som ABANDONED og lagrer grunn i payload.
 * I motsetning til `slettGoal` beholdes historikken.
 */
export async function avbrytGoal(goalId: string, reason: string) {
  AvbrytGoalSchema.parse({ goalId, reason });
  const user = await requireConsentingUser();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  const eksisterende =
    goal.payload &&
    typeof goal.payload === "object" &&
    !Array.isArray(goal.payload)
      ? (goal.payload as Record<string, unknown>)
      : {};

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      status: "ABANDONED",
      payload: {
        ...eksisterende,
        abandonedAt: new Date().toISOString(),
        abandonReason: reason.trim() || null,
      },
    },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}

/**
 * Endre et mål — oppdaterer tittel, type, targetValue og targetDate.
 * Brukes fra «Endre mål»-modalen i mål-detalj.
 */
export async function endreGoal(goalId: string, input: GoalInput) {
  GoalIdSchema.parse(goalId);
  GoalInputSchema.parse(input);
  const user = await requireConsentingUser();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");
  if (!input.title.trim()) throw new Error("missing-title");

  const eksisterende =
    goal.payload && typeof goal.payload === "object" && !Array.isArray(goal.payload)
      ? (goal.payload as Record<string, unknown>)
      : {};

  // SG-felter fjernes hvis målet ikke lenger er et SG-mål — ellers ville et
  // gammelt område ligget igjen og gitt fremdrift for feil ting.
  const payload =
    input.type === "SG_AREA"
      ? await byggSgPayload(user.id, eksisterende, input.sgOmrade)
      : await byggSgPayload(user.id, eksisterende, null);

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      type: input.type,
      title: input.title.trim(),
      targetValue: input.targetValue ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      payload: Object.keys(payload).length > 0 ? payload : Prisma.DbNull,
    },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}
