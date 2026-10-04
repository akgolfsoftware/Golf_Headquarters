import "server-only";

/**
 * Delt autorisasjon for teknisk-plan (runde 2 · 2026-07-14). Trukket ut fra
 * src/app/portal/tren/teknisk-plan/actions.ts sin lokale
 * ensurePlanAccess, slik at andre moduler (task-media.ts) kan gjenbruke
 * samme regel uten å eksponere den som en "use server"-action.
 */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertNotAwaitingConsent } from "@/lib/auth/requireConsentingUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";

export async function ensurePlanAccess(planId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");
  assertNotAwaitingConsent(user);
  const plan = await prisma.technicalPlan.findUnique({
    where: { id: planId },
    select: { userId: true, opprettetAvId: true },
  });
  if (!plan) throw new Error("Plan ikke funnet");
  // Oppretteren er historikk, ikke en varig tilgangsrelasjon. En trener som
  // ikke lenger følger spilleren skal heller ikke kunne skrive via plan-ID.
  let allowed = plan.userId === user.id;
  if (!allowed && (user.role === "COACH" || user.role === "ADMIN")) {
    // ADMIN følger samme dokumenterte AgencyOS-grense: coachede spillere,
    // ikke selvbetjente PlayerHQ-kontoer. COACH avgrenses også til egne spillere.
    allowed = await harCoachTilgangTilSpiller(user, plan.userId);
  }
  if (!allowed) throw new Error("Ingen tilgang");
  return { user, plan };
}
