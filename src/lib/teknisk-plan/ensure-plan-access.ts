import "server-only";

/**
 * Delt autorisasjon for teknisk-plan (runde 2 · 2026-07-14). Trukket ut fra
 * src/app/portal/(legacy)/tren/teknisk-plan/actions.ts sin lokale
 * ensurePlanAccess, slik at andre moduler (task-media.ts) kan gjenbruke
 * samme regel uten å eksponere den som en "use server"-action.
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertNotAwaitingConsent } from "@/lib/auth/requireConsentingUser";

export async function ensurePlanAccess(planId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");
  assertNotAwaitingConsent(user);
  const plan = await prisma.technicalPlan.findUnique({
    where: { id: planId },
    select: { userId: true, opprettetAvId: true },
  });
  if (!plan) throw new Error("Plan ikke funnet");
  const isOwner = plan.userId === user.id || plan.opprettetAvId === user.id;
  const isCoachOrAdmin = user.role === "COACH" || user.role === "ADMIN";
  if (!isOwner && !isCoachOrAdmin) throw new Error("Ingen tilgang");
  return { user, plan };
}
