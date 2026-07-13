import type { SubscriptionStatus } from "@/generated/prisma/client";

/**
 * Kan abonnementet bruke coaching-credits akkurat nå?
 *
 * Forretningsregel (Anders, 2026-07-13): credits skal fungere UT betalt
 * periode etter avbestilling. Et CANCELLED-abonnement med currentPeriodEnd
 * frem i tid er altså fortsatt «betalt» — kunden har betalt for perioden og
 * beholder timene sine til den utløper. Uten currentPeriodEnd (aldri satt av
 * Stripe) er CANCELLED = stengt.
 *
 * Brukes av ALLE credit-porter (server-håndhevelse + UI-visning) så regelen
 * bor ett sted.
 */
export function kanBrukeCredits(
  sub: { status: SubscriptionStatus; currentPeriodEnd: Date | null } | null,
  now: Date = new Date(),
): boolean {
  if (!sub) return false;
  if (sub.status === "ACTIVE") return true;
  return sub.status === "CANCELLED" && sub.currentPeriodEnd != null && sub.currentPeriodEnd > now;
}
