"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "./accept-plan-action";

/** Spiller eier egen action; coach/admin kun for coachede spillere (+ coachId-match). */
async function assertPlanActionAccess(
  user: { id: string; role: string },
  action: { userId: string; coachId: string | null },
): Promise<void> {
  if (action.userId === user.id) return;
  if (user.role === "ADMIN") return;
  if (user.role !== "COACH") throw new Error("forbidden");
  // Tildelt annen coach → nei
  if (action.coachId && action.coachId !== user.id) throw new Error("forbidden");
  if (!(await harCoachTilgangTilSpiller(user, action.userId))) {
    throw new Error("forbidden");
  }
}

export async function acceptPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  await assertPlanActionAccess(user, action);
  if (action.status !== "PENDING") return;

  await acceptAndApplyPlanAction(actionId, undefined, user.id);

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

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  await assertPlanActionAccess(user, action);

  // Grunn er valgfri men verdifull eval-data — trimmes og caps til 500 tegn.
  const rejectReason =
    typeof reason === "string" && reason.trim().length > 0
      ? reason.trim().slice(0, 500)
      : undefined;

  await prisma.planAction.update({
    where: { id: actionId },
    data: {
      status: "REJECTED",
      decidedAt: new Date(),
      decidedById: user.id,
      ...(rejectReason ? { rejectReason } : {}),
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
  revalidatePath("/admin/agenticos");
  revalidatePath("/admin/agenticos/godkjenn");
  revalidatePath("/admin/agenticos/ko");
}