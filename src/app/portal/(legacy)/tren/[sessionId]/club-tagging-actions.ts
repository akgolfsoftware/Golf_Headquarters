"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import type { TrackManEnvironment } from "@/generated/prisma/client";

type ClubInput = {
  club: string;
  shotCount?: number;
  environment: TrackManEnvironment;
};

export async function tagClubsPracticed(
  sessionId: string,
  clubs: ClubInput[],
) {
  const user = await requireConsentingUser();

  // Verifiser at sesjonen tilhører brukeren
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { plan: { select: { userId: true } } },
  });

  if (!session || session.plan.userId !== user.id) {
    throw new Error("Ingen tilgang");
  }

  await prisma.clubsPracticed.createMany({
    data: clubs.map((c) => ({
      sessionId,
      club: c.club,
      shotCount: c.shotCount ?? null,
      environment: c.environment,
    })),
    skipDuplicates: false,
  });

  revalidatePath(`/portal/tren/${sessionId}`);
}
