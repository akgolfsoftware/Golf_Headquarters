"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export type TurnPriority = "MAJOR" | "NORMAL" | "LOCAL";

export async function leggTilTurnering(input: {
  seasonPlanId?: string;
  tournamentId?: string;
  manualName?: string;
  manualDate?: string;
  manualEndDate?: string;
  category?: string;
  priority: TurnPriority;
  notes?: string;
}): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  if (!input.tournamentId && !input.manualName) {
    return { ok: false, feil: "Velg turnering eller oppgi navn" };
  }

  // Verify seasonPlan ownership if provided
  if (input.seasonPlanId) {
    const plan = await prisma.seasonPlan.findFirst({
      where: { id: input.seasonPlanId, userId: user.id },
      select: { id: true },
    });
    if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };
  }

  const entry = await prisma.tournamentEntry.create({
    data: {
      userId: user.id,
      seasonPlanId: input.seasonPlanId ?? null,
      tournamentId: input.tournamentId ?? null,
      manualName: input.manualName ?? null,
      manualDate: input.manualDate ? new Date(input.manualDate) : null,
      manualEndDate: input.manualEndDate ? new Date(input.manualEndDate) : null,
      category: input.category ?? null,
      priority: input.priority,
      notes: input.notes ?? null,
    },
    select: { id: true },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true, id: entry.id };
}

export async function oppdaterTournamentEntry(
  id: string,
  data: {
    category?: string;
    priority?: TurnPriority;
    notes?: string;
    seasonPlanId?: string | null;
  }
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!entry) return { ok: false, feil: "Ikke funnet" };

  await prisma.tournamentEntry.update({
    where: { id },
    data: {
      category: data.category,
      priority: data.priority,
      notes: data.notes,
      seasonPlanId: data.seasonPlanId,
    },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

export async function slettTournamentEntry(
  id: string
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!entry) return { ok: false, feil: "Ikke funnet" };

  await prisma.tournamentEntry.delete({ where: { id } });
  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}
