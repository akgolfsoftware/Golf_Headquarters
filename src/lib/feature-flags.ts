// Tilgangsregler for PlayerHQ.
//
// LÅST forretningsregel (CLAUDE.md): PlayerHQ-tilgang er GRATIS hvis brukeren
//   (a) er i lanserings-vinduet — ALLE er gratis frem til betaling starter 1. juli 2026,
//   (b) har aktiv coaching-pakke (Performance / Performance Pro → monthlyCredits > 0),
//   (c) er medlem av en gruppe gjennom AK Golf (aktivt GroupMember), eller
//   (d) er i prøveperiode (30 dager fra registrering).
// Ellers koster PlayerHQ 300 kr/mnd (faktisk tier PRO = betaler).
//
// "Effektiv tier": PRO = HAR tilgang (gratis ELLER betalt) · GRATIS = MÅ betale.
// Beregnes ETT sted (lib/auth/getCurrentUser) og overskriver user.tier, slik at
// alle gates (som leser user.tier) automatisk reflekterer reell tilgang.
// /portal/meg/abonnement viser FAKTISK tier ved å lese prisma.user direkte.

import type { Tier } from "@/generated/prisma/client";

// Betaling starter 1. juli 2026 (Europe/Oslo). Frem til da har ALLE full tilgang.
const BETALING_STARTER = new Date("2026-07-01T00:00:00.000+02:00");
const PROVEPERIODE_DAGER = 30;

export function gratisForAlle(now: Date = new Date()): boolean {
  return now.getTime() < BETALING_STARTER.getTime();
}

export type TilgangsInput = {
  /** Faktisk tier fra DB. PRO = betaler 300 kr/mnd for app-tilgang. */
  tier: Tier;
  /** Registreringsdato — grunnlag for prøveperiode. */
  createdAt: Date;
  /** Subscription.monthlyCredits (> 0 = aktiv coaching-pakke Performance/Pro). */
  coachingMonthlyCredits: number;
  /** Subscription.status === "ACTIVE". */
  subscriptionActive: boolean;
  /** Har minst ett aktivt gruppemedlemskap (gruppe via AK Golf). */
  iGruppe: boolean;
  now?: Date;
};

/**
 * Beregner effektiv tier etter de låste reglene.
 * Returnerer PRO (har tilgang) eller GRATIS (må betale 300 kr/mnd).
 */
export function beregnEffektivTier(input: TilgangsInput): Tier {
  const now = input.now ?? new Date();
  // (a) Lanserings-vindu: alle gratis frem til betaling starter.
  if (gratisForAlle(now)) return "PRO";
  // Betaler app-abonnement (PRO; ELITE er dødt, men behandles som betalt om det finnes).
  if (input.tier !== "GRATIS") return "PRO";
  // (b) Aktiv coaching-pakke ⇒ gratis app.
  if (input.subscriptionActive && input.coachingMonthlyCredits > 0) return "PRO";
  // (c) Gruppe via AK Golf ⇒ gratis app.
  if (input.iGruppe) return "PRO";
  // (d) Prøveperiode: 30 dager fra registrering.
  const proveSlutt = input.createdAt.getTime() + PROVEPERIODE_DAGER * 86_400_000;
  if (now.getTime() < proveSlutt) return "PRO";
  // Ingen gratis-vei og betaler ikke ⇒ må betale.
  return "GRATIS";
}

/** Banner-info: gratis for alle frem til betaling starter 1. juli. */
export const PRO_KAMPANJE_INFO = {
  aktiv: gratisForAlle(),
  utlopISO: BETALING_STARTER.toISOString(),
  utlopFormatted: BETALING_STARTER.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
};
