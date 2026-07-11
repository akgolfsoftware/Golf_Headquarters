"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

/**
 * Opprett en rask økt direkte fra kalender-klikk.
 * Finner eller oppretter auto-planen "Egne økter" for spilleren.
 */
export async function opprettRaskOkt(input: {
  title: string;
  pyramidArea: PyramidArea;
  durationMin: number;
  scheduledAt: string; // ISO string
}): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return { ok: false, feil: "Krever Pro-abonnement" };
  }

  const scheduledAt = new Date(input.scheduledAt);
  if (isNaN(scheduledAt.getTime())) {
    return { ok: false, feil: "Ugyldig tidspunkt" };
  }

  // Finn eller opprett auto-plan
  let plan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id, name: "Egne økter" },
    select: { id: true },
  });

  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: "Egne økter",
        startDate: scheduledAt,
        isActive: true,
        status: "ACTIVE",
      },
      select: { id: true },
    });
  }

  await prisma.trainingPlanSession.create({
    data: {
      planId: plan.id,
      title: input.title,
      pyramidArea: input.pyramidArea,
      durationMin: Math.max(15, Math.min(360, input.durationMin)),
      scheduledAt,
      status: "PLANNED",
    },
  });

  revalidatePath("/portal/tren/kalender");
  revalidatePath("/portal/tren");
  revalidatePath("/portal");

  return { ok: true };
}
