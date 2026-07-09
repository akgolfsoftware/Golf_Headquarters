"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { propagerGruppeplanEtterEndring } from "@/lib/gruppe/propager-gruppeplan";

type ActionResult = { ok: true } | { ok: false; feil: string };

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "COACH" && user.role !== "ADMIN") return null;
  return user;
}

/**
 * Legger en eksisterende spiller (role PLAYER) inn i en treningsgruppe.
 * Dedup mot @@unique([groupId, userId]): fanges som P2002 → vennlig feil.
 */
export async function leggTilGruppemedlem(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  const gruppe = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true },
  });
  if (!gruppe) return { ok: false, feil: "Fant ikke gruppen." };

  const spiller = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true },
  });
  if (!spiller || spiller.deletedAt) return { ok: false, feil: "Fant ikke spilleren." };
  if (spiller.role !== "PLAYER") return { ok: false, feil: "Bare spillere kan legges til i en gruppe." };

  try {
    await prisma.groupMember.create({
      data: { groupId, userId },
    });
  } catch (e) {
    // P2002: unique constraint — spilleren er allerede medlem.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, feil: "Spilleren er allerede medlem av gruppen." };
    }
    throw e;
  }

  await audit({
    actorId: coach.id,
    action: "group_member.added",
    target: `Group:${groupId}/User:${userId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  await propagerGruppeplanEtterEndring(groupId).catch(() => undefined);
  return { ok: true };
}

/**
 * Fjerner en spiller fra en gruppe. Idempotent: ukjent medlemskap → vennlig feil.
 */
export async function fjernGruppemedlem(
  groupId: string,
  userId: string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  try {
    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
  } catch (e) {
    // P2025: record not found — medlemskapet finnes ikke (lenger).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { ok: false, feil: "Spilleren er ikke medlem av gruppen." };
    }
    throw e;
  }

  await audit({
    actorId: coach.id,
    action: "group_member.removed",
    target: `Group:${groupId}/User:${userId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true };
}

export type GroupScheduleInput = {
  title: string;
  startAt: string;
  endAt: string;
  location?: string | null;
  description?: string | null;
  recurring?: "WEEKLY" | "NONE" | null;
};

/** Opprett eller oppdater fast ukentlig gruppetid + propagér til medlemmer. */
export async function lagreGroupSchedule(
  groupId: string,
  input: GroupScheduleInput,
  scheduleId?: string,
): Promise<ActionResult & { scheduleId?: string }> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  const title = input.title.trim().slice(0, 120);
  if (!title) return { ok: false, feil: "Tittel mangler." };
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { ok: false, feil: "Ugyldig tidspunkt." };
  }
  if (endAt <= startAt) return { ok: false, feil: "Slutt må være etter start." };

  const data = {
    groupId,
    title,
    startAt,
    endAt,
    location: input.location?.trim() || null,
    description: input.description?.trim() || null,
    recurring: input.recurring ?? "WEEKLY",
  };

  const row = scheduleId
    ? await prisma.groupSchedule.update({ where: { id: scheduleId }, data })
    : await prisma.groupSchedule.create({ data });

  await propagerGruppeplanEtterEndring(groupId);
  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true, scheduleId: row.id };
}

/** Slett gruppetid og fjern propagerte plan-økter ved neste synk. */
export async function slettGroupSchedule(
  groupId: string,
  scheduleId: string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  await prisma.groupSchedule.delete({ where: { id: scheduleId, groupId } });
  await propagerGruppeplanEtterEndring(groupId);
  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}

/** Manuell re-synk av gruppeplan til alle medlemmer. */
export async function synkGruppeplanTilMedlemmer(groupId: string): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };
  await propagerGruppeplanEtterEndring(groupId);
  revalidatePath(`/admin/grupper/${groupId}`);
  return { ok: true };
}
