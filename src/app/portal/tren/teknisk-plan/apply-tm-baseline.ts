"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/**
 * Godkjenn foreslått baseline fra PlanAction (TM_BASELINE_PROPOSE).
 * Oppdaterer PositionTaskTmGoal.baselineValue — coach eller spiller.
 */
export async function applyTmBaselineProposal(
  planActionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findFirst({
    where: {
      id: planActionId,
      status: "PENDING",
      actionType: "TM_BASELINE_PROPOSE",
    },
  });
  if (!action) return { ok: false, error: "Forslaget finnes ikke eller er allerede behandlet." };

  // Spiller eier, eller coach/admin
  if (action.userId !== user.id && user.role === "PLAYER") {
    return { ok: false, error: "Ingen tilgang." };
  }
  if (
    action.userId !== user.id &&
    user.role !== "COACH" &&
    user.role !== "ADMIN"
  ) {
    return { ok: false, error: "Ingen tilgang." };
  }

  const suggestion = action.suggestion as {
    goalId?: string;
    proposedBaseline?: number;
    technicalPlanId?: string;
  } | null;
  if (!suggestion?.goalId || typeof suggestion.proposedBaseline !== "number") {
    return { ok: false, error: "Ugyldig forslag." };
  }

  await prisma.positionTaskTmGoal.update({
    where: { id: suggestion.goalId },
    data: {
      baselineValue: suggestion.proposedBaseline,
      baselineFrom: "test-propose",
      baselineDate: new Date(),
    },
  });

  await prisma.planAction.update({
    where: { id: planActionId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/portal/tren/teknisk-plan");
  if (suggestion.technicalPlanId) {
    revalidatePath(`/portal/tren/teknisk-plan/${suggestion.technicalPlanId}`);
  }
  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/spillere/${action.userId}`);

  return { ok: true };
}
