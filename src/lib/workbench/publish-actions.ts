"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PlanStatus } from "@/generated/prisma/client";

const PUBLISHABLE: PlanStatus[] = ["DRAFT", "REJECTED"];

function revalidateWorkbench(playerId: string) {
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
}

/**
 * Publiser aktiv treningsplan: DRAFT/REJECTED → PENDING_PLAYER.
 * Coach sender med `playerId`; spiller publiserer egen plan uten id.
 */
export async function publishWorkbenchPlan(
  playerId?: string,
): Promise<{ ok: boolean; error?: string; status?: PlanStatus }> {
  const user = await requirePortalUser(
    playerId ? { allow: ["COACH", "ADMIN"] } : { allow: ["PLAYER", "COACH", "ADMIN"] },
  );

  const targetUserId = playerId ?? user.id;
  if (!playerId && user.id !== targetUserId) {
    return { ok: false, error: "Ikke tillatt" };
  }

  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: targetUserId, isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, status: true, userId: true },
  });

  if (!plan) {
    return { ok: false, error: "Ingen aktiv plan å publisere" };
  }

  if (!PUBLISHABLE.includes(plan.status)) {
    return { ok: false, error: "Planen er allerede publisert eller aktiv" };
  }

  await prisma.trainingPlan.update({
    where: { id: plan.id },
    data: { status: "PENDING_PLAYER", playerComment: null },
  });

  try {
    await prisma.notification.create({
      data: {
        userId: plan.userId,
        type: "plan",
        title: "Ny treningsplan venter på godkjenning",
        body: `Planen «${plan.name}» er sendt til deg. Åpne Workbench for å godkjenne.`,
        link: "/portal/planlegge/workbench",
      },
    });
  } catch (err) {
    console.error("[workbench] Kunne ikke opprette plan-varsel", err);
  }

  revalidateWorkbench(targetUserId);
  return { ok: true, status: "PENDING_PLAYER" };
}