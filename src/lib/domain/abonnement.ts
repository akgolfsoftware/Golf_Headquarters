/**
 * Abonnement-domenet v2 (plan A1) — ren logikk, ingen IO.
 *
 * Siden A1 har en bruker maks ÉN rad per kind i subscriptions:
 *   COACHING  — Performance / Performance Pro (credits-pakkene)
 *   PLAYERHQ  — app-abonnementet (299 kr/mnd eller 2 690 kr/år)
 *
 * «Aktiv pakke» er definert ETT sted her (`harAktivPakke`) og gjelder begge
 * kind — regelen fra 2026-07-13 (CANCELLED med resttid er fortsatt betalt)
 * gjelder nå også tilgangsberegningen, som implementerer «PlayerHQ-tilgang
 * følger coaching-pakken ut perioden» (Anders 2026-08-16).
 */

import { z } from "zod";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export const ABONNEMENT_KIND = ["COACHING", "PLAYERHQ"] as const;
export type AbonnementKind = (typeof ABONNEMENT_KIND)[number];

export const ABONNEMENT_PLAN = [
  "PLAYERHQ_MND",
  "PLAYERHQ_AAR",
  "PERFORMANCE",
  "PERFORMANCE_PRO",
  "MANUELL",
] as const;
export type AbonnementPlan = (typeof ABONNEMENT_PLAN)[number];

export const abonnementPlanSchema = z.enum(ABONNEMENT_PLAN);
export const abonnementKindSchema = z.enum(ABONNEMENT_KIND);

/** Priser i øre — kanon (Anders 2026-08-16). Årsprisen = «tre måneder gratis». */
export const PLAYERHQ_PRIS_MND_ORE = 299_00;
export const PLAYERHQ_PRIS_AAR_ORE = 2_690_00;
/** 299 × 12 − 2 690 = 898 kr spart per år. */
export const PLAYERHQ_AAR_BESPARELSE_ORE = PLAYERHQ_PRIS_MND_ORE * 12 - PLAYERHQ_PRIS_AAR_ORE;

export interface AbonnementLite {
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
}

/**
 * Er abonnementet «betalt akkurat nå»? Forretningsregel (2026-07-13, utvidet
 * A1): ACTIVE, TRIALING (vinn-tilbake-broen: nytt PlayerHQ-abonnement i trial
 * frem til coaching-perioden utløper), eller CANCELLED med currentPeriodEnd
 * frem i tid (kunden har betalt perioden ut).
 */
export function harAktivPakke(sub: AbonnementLite | null, now: Date = new Date()): boolean {
  if (!sub) return false;
  if (sub.status === "ACTIVE" || sub.status === "TRIALING") return true;
  return sub.status === "CANCELLED" && sub.currentPeriodEnd != null && sub.currentPeriodEnd > now;
}

export interface PlayerHqAbonnementLite extends AbonnementLite {
  plan: string | null;
  stripeSubscriptionId: string | null;
}

/**
 * Gir PLAYERHQ-raden faktisk app-tilgang? Anker-rader (kun stripeCustomerId
 * fra checkout, plan null) gir ALDRI tilgang. MANUELL-rader (admin-opprettet,
 * uten Stripe) krever ACTIVE. Stripe-rader følger harAktivPakke.
 */
export function girPlayerHqTilgang(
  sub: PlayerHqAbonnementLite | null,
  now: Date = new Date(),
): boolean {
  if (!sub || sub.plan == null) return false;
  if (sub.plan === "MANUELL") return sub.status === "ACTIVE";
  if (sub.stripeSubscriptionId == null) return false;
  return harAktivPakke(sub, now);
}

/**
 * Coaching-pakkens visningsnavn fra credits-tallet — DEN ENE kilden
 * (var duplisert i tre meg-sider før A1). null = ingen coaching-pakke.
 */
export function pakkeNavn(monthlyCredits: number): "Performance Pro" | "Performance" | null {
  if (monthlyCredits >= 4) return "Performance Pro";
  if (monthlyCredits > 0) return "Performance";
  return null;
}

/** Visningsnavn for PlayerHQ-planene (abonnementssidene). */
export function planNavn(plan: string | null): string | null {
  switch (plan) {
    case "PLAYERHQ_MND":
      return "PlayerHQ månedlig";
    case "PLAYERHQ_AAR":
      return "PlayerHQ årlig";
    case "PERFORMANCE":
      return "Performance";
    case "PERFORMANCE_PRO":
      return "Performance Pro";
    case "MANUELL":
      return "Manuelt abonnement";
    default:
      return null;
  }
}
