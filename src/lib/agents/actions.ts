"use server";

import { z } from "zod";
import { erAkUkeforslag, behandleAkUkeforslag } from "@/lib/deling/ak-ukeforslag";
import { erAkTreningsobservasjon, behandleAkTreningsobservasjon } from "@/lib/deling/ak-treningsobservasjon";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "./accept-plan-action";
import { planActionAvvisSpor } from "./plan-action-spor";
import { kanBehandlePlanAction } from "./plan-action-tilgang";

/** Spiller eier egen action; coach/admin kun for coachede spillere (+ coachId-match). */
async function assertPlanActionAccess(
  user: { id: string; role: string },
  action: { userId: string; coachId: string | null },
): Promise<void> {
  const harSpillerTilgang =
    user.role === "COACH" || user.role === "ADMIN" ? await harCoachTilgangTilSpiller(user, action.userId) : false;
  if (
    !kanBehandlePlanAction({
      viewerId: user.id,
      viewerRole: user.role,
      actionUserId: action.userId,
      actionCoachId: action.coachId,
      harSpillerTilgang,
    })
  ) {
    throw new Error("forbidden");
  }
}

export async function acceptPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  actionId = z.string().trim().min(1).max(200).parse(actionId);
  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
    select: { id: true, userId: true, coachId: true, actionType: true, agentName: true, status: true },
  });
  if (!action) throw new Error("not-found");
  if (erAkUkeforslag(action)) {
    await behandleAkUkeforslag(user, actionId, "ACCEPTED");
  } else if (erAkTreningsobservasjon(action)) {
    await behandleAkTreningsobservasjon(user, actionId, "ACCEPTED");
  } else {
    await assertPlanActionAccess(user, action);
    if (action.status !== "PENDING") return;
    await acceptAndApplyPlanAction(actionId, undefined, user.id);
  }

  revalidatePath("/admin/agents/training-gap");
  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/godkjenninger/${actionId}`);
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/agenticos");
  revalidatePath("/admin/agenticos/godkjenn");
  revalidatePath("/admin/agenticos/ko");
  revalidatePath("/portal/tren/teknisk-plan");
  revalidatePath("/portal/mal/trackman");
}

export async function rejectPlanAction(actionId: string, reason?: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  actionId = z.string().trim().min(1).max(200).parse(actionId);
  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
    select: { id: true, userId: true, coachId: true, actionType: true, agentName: true, status: true },
  });
  if (!action) throw new Error("not-found");
  if (erAkUkeforslag(action)) {
    await behandleAkUkeforslag(user, actionId, "REJECTED", reason);
  } else if (erAkTreningsobservasjon(action)) {
    await behandleAkTreningsobservasjon(user, actionId, "REJECTED", reason);
  } else {
    await assertPlanActionAccess(user, action);
    if (action.status !== "PENDING") return;

    // Grunn er valgfri men verdifull eval-data — trimmes og caps til 500 tegn.
    const rejectReason =
      typeof reason === "string" && reason.trim().length > 0
        ? reason.trim().slice(0, 500)
        : undefined;

    const rejected = await prisma.planAction.updateMany({
      where: { id: actionId, status: "PENDING" },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
        decidedById: user.id,
        ...(rejectReason ? { rejectReason } : {}),
      },
    });
    if (rejected.count !== 1) return;
    await prisma.agentRun.create({
      data: planActionAvvisSpor({
        actionId,
        actionType: action.actionType,
        userId: action.userId,
      }),
    });
  }

  revalidatePath("/admin/agents/training-gap");
  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
  revalidatePath("/admin/agenticos");
  revalidatePath("/admin/agenticos/godkjenn");
  revalidatePath("/admin/agenticos/ko");
}
