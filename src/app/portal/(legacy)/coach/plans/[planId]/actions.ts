"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/**
 * Spiller-handlinger på en treningsplan som er sendt til godkjenning.
 * Auth-regel: kun spilleren som eier planen (plan.userId === user.id) kan utføre
 * disse handlingene. Coach-handlinger bor i src/app/admin/plans/[planId]/actions.ts.
 */

type Resultat = { ok: true } | { ok: false; feil: string };

async function krevPlanEier(planId: string) {
  const user = await requirePortalUser();
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { id: true, userId: true, status: true, name: true, createdById: true },
  });
  if (!plan) {
    return { user, plan: null as null, feil: "not-found" as const };
  }
  if (plan.userId !== user.id) {
    return { user, plan: null as null, feil: "forbidden" as const };
  }
  return { user, plan, feil: null as null };
}

/**
 * Spiller godtar planen. Krever status PENDING_PLAYER.
 * Setter status til ACCEPTED.
 */
export async function godtaPlan(planId: string): Promise<Resultat> {
  const { user, plan, feil } = await krevPlanEier(planId);
  if (feil) return { ok: false, feil };

  if (plan.status !== "PENDING_PLAYER") {
    return { ok: false, feil: "Planen er ikke til godkjenning." };
  }

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "ACCEPTED", playerComment: null },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.player.accept",
      target: planId,
      metadata: { planName: plan.name },
    },
  });

  revalidatePath(`/portal/coach/plans/${planId}`);
  revalidatePath(`/admin/plans/${planId}`);
  return { ok: true };
}

/**
 * Spiller ber om endring. Krever status PENDING_PLAYER og en kommentar.
 * Setter status til REJECTED og lagrer kommentaren i playerComment.
 */
export async function beOmEndring(
  planId: string,
  kommentar: string,
): Promise<Resultat> {
  const trimmet = kommentar.trim();
  if (trimmet.length < 5) {
    return { ok: false, feil: "Skriv en kort begrunnelse (minst 5 tegn)." };
  }
  if (trimmet.length > 2000) {
    return { ok: false, feil: "Kommentaren er for lang (maks 2000 tegn)." };
  }

  const { user, plan, feil } = await krevPlanEier(planId);
  if (feil) return { ok: false, feil };

  if (plan.status !== "PENDING_PLAYER") {
    return { ok: false, feil: "Planen er ikke til godkjenning." };
  }

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "REJECTED", playerComment: trimmet },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.player.reject",
      target: planId,
      metadata: { planName: plan.name, kommentar: trimmet },
    },
  });

  revalidatePath(`/portal/coach/plans/${planId}`);
  revalidatePath(`/admin/plans/${planId}`);
  return { ok: true };
}

/**
 * Spiller trekker tilbake en avvisning — planen settes tilbake til PENDING_PLAYER
 * og kommentaren fjernes. Krever status REJECTED.
 */
export async function trekkTilbakeAvvisning(planId: string): Promise<Resultat> {
  const { user, plan, feil } = await krevPlanEier(planId);
  if (feil) return { ok: false, feil };

  if (plan.status !== "REJECTED") {
    return { ok: false, feil: "Planen er ikke avvist." };
  }

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "PENDING_PLAYER", playerComment: null },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.player.withdraw",
      target: planId,
      metadata: { planName: plan.name },
    },
  });

  revalidatePath(`/portal/coach/plans/${planId}`);
  revalidatePath(`/admin/plans/${planId}`);
  return { ok: true };
}
