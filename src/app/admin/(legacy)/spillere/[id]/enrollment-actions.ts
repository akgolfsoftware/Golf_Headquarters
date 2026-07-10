"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import type { PlayerProgram } from "@/generated/prisma/client";

/** Legg spiller til et program. Coach-valg er valgfritt for PLATFORM_ONLY. */
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
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  await prisma.playerEnrollment.create({
    data: {
      userId: playerId,
      program,
      coachId: coachId ?? null,
      notes: notes ?? null,
    },
  });

  revalidatePath(`/admin/spillere/${playerId}`);
  revalidatePath("/admin/spillere");
}

/** Avslutt en enrollering — setter endedAt til nå. Sletter IKKE spilleren. */
export async function endEnrollment(enrollmentId: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const enrollment = await prisma.playerEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { userId: true },
  });

  if (!enrollment) return;

  await prisma.playerEnrollment.update({
    where: { id: enrollmentId },
    data: { endedAt: new Date() },
  });

  revalidatePath(`/admin/spillere/${enrollment.userId}`);
  revalidatePath("/admin/spillere");
}
