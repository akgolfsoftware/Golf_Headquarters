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

/**
 * Meld meg på en turnering fra katalogen. Oppretter TournamentEntry for
 * innlogget bruker. Kobler automatisk til årets SeasonPlan hvis den finnes.
 */
export async function meldDegPa(
  tournamentId: string,
): Promise<{ ok: true; id: string } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const turnering = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, startDate: true },
  });
  if (!turnering) return { ok: false, feil: "Turnering ikke funnet" };

  const eksisterende = await prisma.tournamentEntry.findFirst({
    where: { userId: user.id, tournamentId },
    select: { id: true },
  });
  if (eksisterende) return { ok: false, feil: "Allerede påmeldt" };

  // Finn årets sesongplan basert på turneringens startdato
  const year = turnering.startDate.getFullYear();
  const sesongplan = await prisma.seasonPlan.findFirst({
    where: { userId: user.id, year },
    select: { id: true },
  });

  const entry = await prisma.tournamentEntry.create({
    data: {
      userId: user.id,
      tournamentId,
      seasonPlanId: sesongplan?.id ?? null,
      priority: "NORMAL",
    },
    select: { id: true },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  revalidatePath("/portal");
  revalidatePath("/portal/kalender");
  return { ok: true, id: entry.id };
}

/**
 * Meld deg av — sletter TournamentEntry for innlogget bruker.
 */
export async function meldDegAv(
  entryId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  return slettTournamentEntry(entryId);
}

/**
 * Koble en eksisterende TournamentEntry til en SeasonPlan.
 */
export async function koblTilArsplan(
  tournamentEntryId: string,
  seasonPlanId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const entry = await prisma.tournamentEntry.findFirst({
    where: { id: tournamentEntryId, userId: user.id },
    select: { id: true },
  });
  if (!entry) return { ok: false, feil: "Påmelding ikke funnet" };

  const plan = await prisma.seasonPlan.findFirst({
    where: { id: seasonPlanId, userId: user.id },
    select: { id: true },
  });
  if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };

  await prisma.tournamentEntry.update({
    where: { id: tournamentEntryId },
    data: { seasonPlanId },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true };
}

/**
 * Bulk-koble alle TournamentEntry for et gitt år til en SeasonPlan.
 * Plukker entries der dato (tournament.startDate eller manualDate) er i året.
 */
export async function bulkKoblTurneringerTilArsplan(
  seasonPlanId: string,
  year: number,
): Promise<{ ok: true; antall: number } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  const plan = await prisma.seasonPlan.findFirst({
    where: { id: seasonPlanId, userId: user.id },
    select: { id: true },
  });
  if (!plan) return { ok: false, feil: "Sesongplan ikke funnet" };

  const fra = new Date(year, 0, 1);
  const til = new Date(year, 11, 31, 23, 59, 59);

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId: user.id,
      seasonPlanId: null,
      OR: [
        { tournament: { startDate: { gte: fra, lte: til } } },
        { manualDate: { gte: fra, lte: til } },
      ],
    },
    select: { id: true },
  });

  if (entries.length === 0) {
    return { ok: true, antall: 0 };
  }

  await prisma.tournamentEntry.updateMany({
    where: { id: { in: entries.map((e) => e.id) } },
    data: { seasonPlanId },
  });

  revalidatePath("/portal/tren/turneringer");
  revalidatePath("/portal/tren/aarsplan");
  return { ok: true, antall: entries.length };
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
