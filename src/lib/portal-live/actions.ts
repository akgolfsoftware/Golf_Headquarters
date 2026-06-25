"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/** Starter plan-økt fra brief (PLANNED → ACTIVE) og sender til tapper. */
export async function startPlanSession(sessionId: string): Promise<void> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.tier === "GRATIS") {
    redirect("/portal/meg/abonnement");
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      plan: { select: { userId: true } },
    },
  });
  if (!session || session.plan.userId !== user.id) {
    redirect("/portal/planlegge/workbench");
  }

  if (session.status === "COMPLETED" || session.status === "SKIPPED") {
    redirect(`/portal/tren/${sessionId}`);
  }

  if (session.status === "PLANNED") {
    const nowISO = new Date().toISOString();
    await prisma.trainingPlanSession.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE",
        liveSnapshot: {
          startedAtISO: nowISO,
          totalSec: 0,
          updatedAtISO: nowISO,
          drills: [],
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  revalidatePath("/portal/planlegge/workbench");
  revalidatePath(`/portal/live/${sessionId}/brief`);
  redirect(`/portal/live/${sessionId}/tapper`);
}