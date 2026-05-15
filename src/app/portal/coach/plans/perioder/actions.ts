"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { validerPeriodBlock } from "@/lib/taxonomy";
import type { LPhase } from "@/generated/prisma/client";

type PeriodInput = {
  seasonPlanId: string;
  lPhase: LPhase;
  startDate: string;
  endDate: string;
  focus?: string;
  weeklyVolMin?: number;
  weeklyVolMax?: number;
};

export async function opprettPeriodForSpiller(input: PeriodInput) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const plan = await prisma.seasonPlan.findUnique({
    where: { id: input.seasonPlanId },
  });
  if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };

  const validering = validerPeriodBlock(input.lPhase, {
    weeklyVolMax: input.weeklyVolMax,
  });

  if (!validering.ok) {
    return { ok: false, feil: validering.advarsler.join(". ") };
  }

  await prisma.periodBlock.create({
    data: {
      seasonPlanId: input.seasonPlanId,
      lPhase: input.lPhase,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      focus: input.focus || null,
      weeklyVolMin: input.weeklyVolMin ?? null,
      weeklyVolMax: input.weeklyVolMax ?? null,
    },
  });

  revalidatePath("/portal/coach/plans/perioder");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

export async function oppdaterPeriod(
  blockId: string,
  data: Partial<PeriodInput>,
) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const patch: Record<string, unknown> = {};
  if (data.lPhase) patch.lPhase = data.lPhase;
  if (data.startDate) patch.startDate = new Date(data.startDate);
  if (data.endDate) patch.endDate = new Date(data.endDate);
  if (data.focus !== undefined) patch.focus = data.focus || null;
  if (data.weeklyVolMin !== undefined) patch.weeklyVolMin = data.weeklyVolMin ?? null;
  if (data.weeklyVolMax !== undefined) patch.weeklyVolMax = data.weeklyVolMax ?? null;

  await prisma.periodBlock.update({
    where: { id: blockId },
    data: patch,
  });

  revalidatePath("/portal/coach/plans/perioder");
  revalidatePath("/portal/tren/aarsplan");
}

export async function slettPeriodCoach(blockId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  await prisma.periodBlock.delete({ where: { id: blockId } });

  revalidatePath("/portal/coach/plans/perioder");
  revalidatePath("/portal/tren/aarsplan");
}
