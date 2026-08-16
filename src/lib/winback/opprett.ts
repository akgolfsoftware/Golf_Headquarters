/**
 * Vinn-tilbake-tilbudet (plan A4): når en spiller sier opp coaching-pakken
 * (Performance / Performance Pro), tilbys de å beholde PlayerHQ til
 * 299 kr/mnd eller 2 690 kr/år («tre måneder gratis»).
 *
 * `opprettWinbackTilbud` er IDEMPOTENT (unik på userId+coachingSubscriptionId)
 * og kalles fra to steder: cancelPro (umiddelbar respons i appen) og
 * Stripe-webhooken (fanger også oppsigelser gjort i Billing Portal/dashbord).
 * Utsendelse av e-post/varsel gjør winback-agenten (cron) — aldri her, så
 * webhook-responsen ikke blokkeres og dry-run kan styres ett sted.
 */

import { prisma } from "@/lib/prisma";

/**
 * Ren guard (testbar): har spilleren allerede et eget PlayerHQ-abonnement
 * som gir tilgang? Da er det ingenting å vinne tilbake.
 */
export function harBlokkerendePlayerHqAbonnement(
  rad: { plan: string | null; status: string; stripeSubscriptionId: string | null } | null,
): boolean {
  if (!rad || rad.plan == null) return false;
  if (rad.status !== "ACTIVE" && rad.status !== "TRIALING") return false;
  return rad.plan === "MANUELL" || rad.stripeSubscriptionId != null;
}

export async function opprettWinbackTilbud(input: {
  userId: string;
  coachingSubscriptionId: string;
  stripeSubscriptionId?: string | null;
  /** Coaching-periodens slutt = tilbudets utløp. */
  utlopsDato?: Date | null;
}): Promise<{ opprettet: boolean }> {
  // Har spilleren allerede et eget PlayerHQ-abonnement som gir tilgang,
  // er det ingenting å vinne tilbake.
  const playerhq = await prisma.subscription.findUnique({
    where: { userId_kind: { userId: input.userId, kind: "PLAYERHQ" } },
    select: { plan: true, status: true, stripeSubscriptionId: true },
  });
  if (harBlokkerendePlayerHqAbonnement(playerhq)) return { opprettet: false };

  try {
    await prisma.winbackTilbud.create({
      data: {
        userId: input.userId,
        coachingSubscriptionId: input.coachingSubscriptionId,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        utlopsDato: input.utlopsDato ?? null,
        status: "TILBUDT",
      },
    });
    return { opprettet: true };
  } catch (e) {
    // P2002: tilbudet finnes allerede for denne oppsigelsen — idempotent no-op.
    if (
      typeof e === "object" &&
      e !== null &&
      (e as { code?: unknown }).code === "P2002"
    ) {
      return { opprettet: false };
    }
    throw e;
  }
}
