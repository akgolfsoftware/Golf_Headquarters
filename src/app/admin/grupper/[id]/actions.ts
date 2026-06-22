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
