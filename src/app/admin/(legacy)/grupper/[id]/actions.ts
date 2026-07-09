"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

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

/**
 * Opprett gruppe trening på tidspunkt.
 * Støtter antall deltagere (maxParticipants), dato, tid, varighet.
 * recurring = "NONE" for engang.
 */
export async function opprettGruppeTrening(
  groupId: string,
  data: {
    title: string;
    description?: string;
    startAt: Date | string;
    endAt: Date | string;
    location?: string;
    recurring?: string;
    maxParticipants?: number;
  },
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  const gruppe = await prisma.group.findUnique({ where: { id: groupId } });
  if (!gruppe) return { ok: false, feil: "Fant ikke gruppen." };

  const startAt = data.startAt instanceof Date ? data.startAt : new Date(data.startAt);
  const endAt = data.endAt instanceof Date ? data.endAt : new Date(data.endAt);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { ok: false, feil: "Ugyldig dato/tid." };
  }

  try {
    await prisma.groupSchedule.create({
      data: {
        groupId,
        title: data.title,
        description: data.description || null,
        startAt,
        endAt,
        location: data.location || null,
        recurring: data.recurring || "NONE",
        maxParticipants: data.maxParticipants || null,
      },
    });
  } catch (_e) {
    return { ok: false, feil: "Kunne ikke opprette gruppe trening." };
  }

  await audit({
    actorId: coach.id,
    action: "group_schedule.created",
    target: `Group:${groupId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}

/**
 * Dupliser gruppe time.
 * Kopier alle felter, sett ny startAt (dato, tid). Varighet beholdes.
 * Inkluder antall deltagere.
 */
export async function dupliserGruppeTime(
  groupId: string,
  originalId: string,
  newStartAt: Date | string,
): Promise<ActionResult> {
  const coach = await krevCoach();
  if (!coach) return { ok: false, feil: "Ikke tilgang." };

  const original = await prisma.groupSchedule.findUnique({
    where: { id: originalId },
    select: { title: true, description: true, startAt: true, endAt: true, location: true, recurring: true, maxParticipants: true },
  });
  if (!original) return { ok: false, feil: "Fant ikke original tid." };

  const startAt = newStartAt instanceof Date ? newStartAt : new Date(newStartAt);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, feil: "Ugyldig ny tidspunkt." };
  }

  const duration = original.endAt.getTime() - original.startAt.getTime();
  const endAt = new Date(startAt.getTime() + duration);

  try {
    await prisma.groupSchedule.create({
      data: {
        groupId,
        title: original.title,
        description: original.description,
        startAt,
        endAt,
        location: original.location,
        recurring: original.recurring,
        maxParticipants: original.maxParticipants,
      },
    });
  } catch (_e) {
    return { ok: false, feil: "Kunne ikke duplisere." };
  }

  await audit({
    actorId: coach.id,
    action: "group_schedule.duplicated",
    target: `Group:${groupId}/Schedule:${originalId}`,
  });

  revalidatePath(`/admin/grupper/${groupId}`);
  revalidatePath(`/admin/grupper/${groupId}/timeplan`);
  return { ok: true };
}
