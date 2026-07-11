"use server";

/**
 * Server actions for /admin/approvals/[id] — detalj-visningen.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "@/lib/agents/accept-plan-action";
import { LOW_RISK_ACTION_TYPES } from "@/lib/training/skills";

type CoachNote = {
  kind: "approve" | "decline" | "info_request";
  text: string;
  authorId: string;
  at: string;
};

async function attachCoachNote(actionId: string, note: CoachNote) {
  const existing = await prisma.planAction.findUnique({
    where: { id: actionId },
    select: { suggestion: true },
  });
  if (!existing) return null;

  const sugg =
    existing.suggestion && typeof existing.suggestion === "object"
      ? (existing.suggestion as Record<string, unknown>)
      : {};
  const log = Array.isArray(sugg.coachLog) ? sugg.coachLog : [];

  return {
    ...sugg,
    coachLog: [...log, note],
  };
}

export async function approveRequestDetailed(
  actionId: string,
  comment?: string,
) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId, ...coachScopeWhere(user.id) },
  });
  if (!action) throw new Error("not-found");
  if (action.status !== "PENDING") {
    revalidatePath(`/admin/approvals/${actionId}`);
    return;
  }

  const suggestion = comment
    ? await attachCoachNote(actionId, {
        kind: "approve",
        text: comment,
        authorId: user.id,
        at: new Date().toISOString(),
      })
    : undefined;

  await acceptAndApplyPlanAction(
    actionId,
    suggestion as Record<string, unknown> | undefined,
  );

  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/godkjenninger/${actionId}`);
  redirect("/admin/godkjenninger");
}

function coachScopeWhere(coachId: string) {
  return {
    OR: [{ coachId }, { coachId: null }],
  };
}

export async function batchApproveSelected(ids: string[]) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!Array.isArray(ids) || ids.length === 0) {
    return { godkjent: 0, feilet: 0, coachId: user.id };
  }

  const pending = await prisma.planAction.findMany({
    where: {
      id: { in: ids },
      status: "PENDING",
      ...coachScopeWhere(user.id),
    },
    orderBy: { createdAt: "asc" },
  });

  let godkjent = 0;
  let feilet = 0;
  for (const action of pending) {
    try {
      await acceptAndApplyPlanAction(action.id);
      godkjent++;
    } catch {
      feilet++;
    }
  }

  revalidatePath("/admin/godkjenninger");
  return { godkjent, feilet, coachId: user.id };
}

export async function batchApproveLowRisk() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const pending = await prisma.planAction.findMany({
    where: { status: "PENDING", ...coachScopeWhere(user.id) },
    orderBy: { createdAt: "asc" },
  });

  let godkjent = 0;
  for (const action of pending) {
    if (!LOW_RISK_ACTION_TYPES.has(action.actionType)) continue;
    try {
      await acceptAndApplyPlanAction(action.id);
      godkjent++;
    } catch {
      // Hopp over enkeltfeil — coach kan håndtere manuelt
    }
  }

  revalidatePath("/admin/godkjenninger");
  return { godkjent, coachId: user.id };
}

export async function declineRequestDetailed(actionId: string, reason: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!reason || reason.trim().length < 3) {
    throw new Error("begrunnelse-påkrevd");
  }

  const action = await prisma.planAction.findUnique({
    where: { id: actionId, ...coachScopeWhere(user.id) },
  });
  if (!action) throw new Error("not-found");

  const suggestion = await attachCoachNote(actionId, {
    kind: "decline",
    text: reason.trim(),
    authorId: user.id,
    at: new Date().toISOString(),
  });

  await prisma.planAction.update({
    where: { id: actionId },
    data: {
      status: "REJECTED",
      ...(suggestion ? { suggestion } : {}),
    },
  });

  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/godkjenninger/${actionId}`);
  redirect("/admin/godkjenninger");
}

export async function requestMoreInfo(actionId: string, question: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!question || question.trim().length < 3) {
    throw new Error("spørsmål-påkrevd");
  }

  const action = await prisma.planAction.findUnique({
    where: { id: actionId, ...coachScopeWhere(user.id) },
  });
  if (!action) throw new Error("not-found");

  const suggestion = await attachCoachNote(actionId, {
    kind: "info_request",
    text: question.trim(),
    authorId: user.id,
    at: new Date().toISOString(),
  });

  await prisma.planAction.update({
    where: { id: actionId },
    data: {
      ...(suggestion ? { suggestion } : {}),
    },
  });

  await prisma.notification.create({
    data: {
      userId: action.userId,
      type: "approval_question",
      title: "Coach trenger mer info",
      body: question.trim().slice(0, 280),
      link: `/portal/agent-pipeline`,
    },
  });

  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/godkjenninger/${actionId}`);
}