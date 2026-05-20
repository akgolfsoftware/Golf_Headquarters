"use server";

/**
 * Server actions for /admin/approvals/[id] — detalj-visningen.
 *
 * Disse handlerne utvider de eksisterende `acceptPlanAction`/`rejectPlanAction`
 * i `@/lib/agents/actions` ved å tillate ekstra metadata (coach-kommentar,
 * begrunnelse, spørsmål om mer info). De skriver til samme PlanAction-modell
 * og oppdaterer `suggestion.coachNote` så vi beholder revisjons-spor.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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
    where: { id: actionId },
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

  await prisma.planAction.update({
    where: { id: actionId },
    data: {
      status: "ACCEPTED",
      ...(suggestion ? { suggestion } : {}),
    },
  });

  revalidatePath("/admin/approvals");
  revalidatePath(`/admin/approvals/${actionId}`);
  redirect("/admin/approvals");
}

export async function declineRequestDetailed(actionId: string, reason: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!reason || reason.trim().length < 3) {
    throw new Error("begrunnelse-påkrevd");
  }

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
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

  revalidatePath("/admin/approvals");
  revalidatePath(`/admin/approvals/${actionId}`);
  redirect("/admin/approvals");
}

export async function requestMoreInfo(actionId: string, question: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!question || question.trim().length < 3) {
    throw new Error("spørsmål-påkrevd");
  }

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");

  const suggestion = await attachCoachNote(actionId, {
    kind: "info_request",
    text: question.trim(),
    authorId: user.id,
    at: new Date().toISOString(),
  });

  // Behold PENDING — handler venter på respons.
  await prisma.planAction.update({
    where: { id: actionId },
    data: {
      ...(suggestion ? { suggestion } : {}),
    },
  });

  // Send notifikasjon til spilleren.
  await prisma.notification.create({
    data: {
      userId: action.userId,
      type: "approval_question",
      title: "Coach trenger mer info",
      body: question.trim().slice(0, 280),
      link: `/portal/agent-pipeline`,
    },
  });

  revalidatePath("/admin/approvals");
  revalidatePath(`/admin/approvals/${actionId}`);
}
