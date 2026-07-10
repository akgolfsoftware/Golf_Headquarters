"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// SeasonPlan
// ---------------------------------------------------------------------------

export async function opprettSeasonPlan(input: {
  year: number;
  startDate: string;
  endDate: string;
  name?: string;
  notes?: string;
}): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { ok: false, feil: "Ugyldig dato" };
  }
  if (end <= start) {
    return { ok: false, feil: "Sluttdato må være etter startdato" };
  }

  try {
    const plan = await prisma.seasonPlan.create({
      data: {
        userId: user.id,
        year: input.year,
        name: input.name ?? `Sesong ${input.year}`,
        startDate: start,
        endDate: end,
        notes: input.notes,
      },
      select: { id: true },
    });

    revalidatePath("/portal/tren/aarsplan");
    return { ok: true, id: plan.id };
  } catch {
    return { ok: false, feil: "Sesongplan for dette året finnes allerede" };
  }
}

export async function oppdaterSeasonPlan(
  id: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const plan = await prisma.seasonPlan.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!plan) return { ok: false, feil: "Ikke funnet" };

  const patch: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
  } = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.startDate) patch.startDate = new Date(data.startDate);
  if (data.endDate) patch.endDate = new Date(data.endDate);
  if (data.notes !== undefined) patch.notes = data.notes;

  await prisma.seasonPlan.update({ where: { id }, data: patch });
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// PeriodBlock
// ---------------------------------------------------------------------------

export async function opprettPeriodBlock(input: {
  seasonPlanId: string;
  lPhase: LPhase;
  startDate: string;
  endDate: string;
  focus?: string;
  weeklyVolMin?: number;
  weeklyVolMax?: number;
  notes?: string;
}): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  // Verify ownership
  const plan = await prisma.seasonPlan.findFirst({
    where: { id: input.seasonPlanId, userId: user.id },
    select: { id: true },
  });
  if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { ok: false, feil: "Ugyldig dato" };
  }
  if (end <= start) {
    return { ok: false, feil: "Sluttdato må være etter startdato" };
  }

  const block = await prisma.periodBlock.create({
    data: {
      seasonPlanId: input.seasonPlanId,
      lPhase: input.lPhase,
      startDate: start,
      endDate: end,
      focus: input.focus,
      weeklyVolMin: input.weeklyVolMin,
      weeklyVolMax: input.weeklyVolMax,
      notes: input.notes,
    },
    select: { id: true },
  });

  revalidatePath("/portal/tren/aarsplan");
  return { ok: true, id: block.id };
}

export async function oppdaterPeriodBlock(
  id: string,
  data: {
    lPhase?: LPhase;
    startDate?: string;
    endDate?: string;
    focus?: string;
    weeklyVolMin?: number;
    weeklyVolMax?: number;
    notes?: string;
  }
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  // Verify ownership via seasonPlan
  const block = await prisma.periodBlock.findFirst({
    where: { id },
    include: { seasonPlan: { select: { userId: true } } },
  });
  if (!block || block.seasonPlan.userId !== user.id) {
    return { ok: false, feil: "Ikke funnet" };
  }

  const patch: {
    lPhase?: LPhase;
    startDate?: Date;
    endDate?: Date;
    focus?: string;
    weeklyVolMin?: number;
    weeklyVolMax?: number;
    notes?: string;
  } = {};
  if (data.lPhase) patch.lPhase = data.lPhase;
  if (data.startDate) patch.startDate = new Date(data.startDate);
  if (data.endDate) patch.endDate = new Date(data.endDate);
  if (data.focus !== undefined) patch.focus = data.focus;
  if (data.weeklyVolMin !== undefined) patch.weeklyVolMin = data.weeklyVolMin;
  if (data.weeklyVolMax !== undefined) patch.weeklyVolMax = data.weeklyVolMax;
  if (data.notes !== undefined) patch.notes = data.notes;

  await prisma.periodBlock.update({ where: { id }, data: patch });
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

export async function slettPeriodBlock(
  id: string
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const block = await prisma.periodBlock.findFirst({
    where: { id },
    include: { seasonPlan: { select: { userId: true } } },
  });
  if (!block || block.seasonPlan.userId !== user.id) {
    return { ok: false, feil: "Ikke funnet" };
  }

  await prisma.periodBlock.delete({ where: { id } });
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}
