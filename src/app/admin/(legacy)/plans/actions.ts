"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { nonEmpty, isoDate } from "@/lib/validation/schemas";

/**
 * Henter en treningsplan KUN hvis den tilhører en spiller coachen har tilgang
 * til. Alle actions her tar en planId fra klienten — uten porten kunne en coach
 * lese, endre, kopiere og SLETTE en annen coachs spillers plan ved å bytte id.
 */
async function planIScope(
  coach: { id: string; role: string },
  planId: string,
): Promise<{ id: string; userId: string } | null> {
  return prisma.trainingPlan.findFirst({
    where: { id: planId, user: coachScopedPlayerWhere(coach) },
    select: { id: true, userId: true },
  });
}

const PlanIdSchema = z.object({
  planId: z.string().min(1, "Plan-ID er påkrevd"),
});

const CreatePlanSchema = z.object({
  userId: z.string().min(1, "Bruker-ID er påkrevd"),
  name: nonEmpty(300),
  startDate: isoDate,
  endDate: isoDate.optional(),
});


export async function togglePlanActive(planId: string) {
  PlanIdSchema.parse({ planId });
  const coach = await requireCoachActionUser();
  const iScope = await planIScope(coach, planId);
  if (!iScope) throw new Error("not-found");
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");
  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  });
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

export async function dupliserPlan(planId: string): Promise<string | null> {
  PlanIdSchema.parse({ planId });
  const coach = await requireCoachActionUser();
  if (!(await planIScope(coach, planId))) return null;
  const original = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: { sessions: { include: { drills: true } } },
  });
  if (!original) return null;

  const ny = await prisma.trainingPlan.create({
    data: {
      userId: original.userId,
      name: `${original.name} (kopi)`,
      startDate: original.startDate,
      endDate: original.endDate,
      isActive: false,
      createdById: original.createdById,
      sessions: {
        create: original.sessions.map((s) => ({
          scheduledAt: s.scheduledAt,
          durationMin: s.durationMin,
          title: s.title,
          rationale: s.rationale,
          pyramidArea: s.pyramidArea,
          status: "PLANNED",
          drills: {
            create: s.drills.map((d) => ({
              exerciseId: d.exerciseId,
              repsSets: d.repsSets,
              csTarget: d.csTarget,
              notes: d.notes,
              orderIndex: d.orderIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/admin/plans");
  return ny.id;
}

export type CreatePlanInput = {
  userId: string;
  name: string;
  startDate: string;
  endDate?: string;
};

export async function createPlan(input: CreatePlanInput): Promise<string> {
  CreatePlanSchema.parse(input);
  const coach = await requireCoachActionUser();
  // Coach-scoping: userId kommer fra klienten — uten porten kunne en coach
  // opprette en plan på en vilkårlig bruker.
  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(coach), { id: input.userId }] },
    select: { id: true },
  });
  if (!spiller) throw new Error("not-found");
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: input.userId,
      name: input.name.trim() || "Ny plan",
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isActive: true,
      createdById: coach.id,
    },
  });
  revalidatePath("/admin/plans");
  return plan.id;
}

export async function deletePlan(planId: string) {
  const coach = await requireCoachActionUser();
  // Hadde INGEN eierskapssjekk: enhver coach kunne slette hvilken som helst
  // spillers treningsplan (kaskade til økter og driller) ved å bytte id.
  if (!(await planIScope(coach, planId))) throw new Error("not-found");
  await prisma.trainingPlan.delete({ where: { id: planId } });
  revalidatePath("/admin/plans");
  redirect("/admin/plans");
}
