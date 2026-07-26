"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCoachTilgangTilSpiller } from "@/lib/auth/coached";
import type { PlayerProgram } from "@/generated/prisma/client";

/** Legg spiller til et program. Coach kan kun knytte til seg selv. */
export async function addEnrollment({
  playerId,
  program,
  coachId,
  notes,
}: {
  playerId: string;
  program: PlayerProgram;
  coachId: string | null;
  notes: string | null;
}) {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // COACH kan ikke ta over andres stall eller «stjele» selvbetjente uten ADMIN.
  // - ADMIN: fri
  // - COACH: kun coachId = seg selv; hvis spilleren allerede er coachet av andre → nei
  //   (ny lead uten relasjon: ok å knytte til seg selv)
  if (actor.role === "COACH") {
    if (coachId && coachId !== actor.id) {
      throw new Error("Du kan bare knytte spilleren til deg selv.");
    }
    const alleredeAndres = await prisma.playerEnrollment.findFirst({
      where: {
        userId: playerId,
        endedAt: null,
        program: { not: "PLATFORM_ONLY" },
        coachId: { not: null, notIn: [actor.id] },
      },
      select: { id: true },
    });
    if (alleredeAndres) {
      throw new Error("Spilleren tilhører en annen coach.");
    }
  }

  await prisma.playerEnrollment.create({
    data: {
      userId: playerId,
      program,
      coachId:
        actor.role === "COACH" ? actor.id : (coachId ?? null),
      notes: notes ?? null,
    },
  });

  revalidatePath(`/admin/spillere/${playerId}`);
  revalidatePath("/admin/spillere");
}

/** Avslutt en enrollering — setter endedAt til nå. Sletter IKKE spilleren. */
export async function endEnrollment(enrollmentId: string) {
  const actor = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const enrollment = await prisma.playerEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true, coachId: true },
  });

  if (!enrollment) return;

  if (actor.role === "COACH") {
    if (enrollment.coachId === actor.id) {
      // ok — egen enrollment
    } else {
      await assertCoachTilgangTilSpiller(actor, enrollment.userId);
    }
  }

  await prisma.playerEnrollment.update({
    where: { id: enrollmentId },
    data: { endedAt: new Date() },
  });

  revalidatePath(`/admin/spillere/${enrollment.userId}`);
  revalidatePath("/admin/spillere");
}
