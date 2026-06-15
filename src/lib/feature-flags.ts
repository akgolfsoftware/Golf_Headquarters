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

import type { Tier, SubscriptionStatus } from "@/generated/prisma/client";

// Betaling starter 1. juli 2026 (Europe/Oslo). Frem til da har ALLE full tilgang.
const BETALING_STARTER = new Date("2026-07-01T00:00:00.000+02:00");
const PROVEPERIODE_DAGER = 30;

export function gratisForAlle(now: Date = new Date()): boolean {
  return now.getTime() < BETALING_STARTER.getTime();
}

/**
 * Bruker-formet input til resolveTier — nøyaktig det som trengs for å avgjøre
 * effektiv tilgang. Trial utledes av createdAt (+ 30 dager), ikke et eget felt.
 */
export type ResolveTierInput = {
  /** Faktisk tier fra DB. PRO = betaler 300 kr/mnd for app-tilgang. */
  tier: Tier;
  /** Registreringsdato — grunnlag for prøveperiode (createdAt + 30 dager). */
  createdAt: Date;
  /** Brukerens coaching-abonnement (Performance/Pro). null hvis ingen rad. */
  subscription?: { status: SubscriptionStatus; monthlyCredits: number } | null;
  /** Antall aktive gruppemedlemskap (gruppe via AK Golf). */
  groupMembershipsCount: number;
  /** Overstyr "nå" (for test/SSR-determinisme). */
  now?: Date;
};

/**
 * Eneste sannhetskilde for effektiv PlayerHQ-tilgang (de låste reglene, BUSINESS-RULES.md).
 * Returnerer PRO (har tilgang: gratis ELLER betalt) eller GRATIS (må betale 300 kr/mnd).
 * Beregnes ETT sted (lib/auth/getCurrentUser) og overskriver user.tier, slik at alle
 * /portal/*-gater (som leser user.tier) automatisk reflekterer reell tilgang.
 */
export function resolveTier(user: ResolveTierInput): Tier {
  const now = user.now ?? new Date();
  // (a) Lanserings-vindu: ALLE gratis frem til betaling starter 1. juli 2026.
  if (gratisForAlle(now)) return "PRO";
  // Betaler app-abonnement (PRO; ELITE er dødt enum, men behandles som betalt om satt).
  if (user.tier !== "GRATIS") return "PRO";
  // (b) Aktiv coaching-pakke (Performance/Pro) ⇒ gratis app.
  if (user.subscription?.status === "ACTIVE" && user.subscription.monthlyCredits > 0) {
    return "PRO";
  }
  // (c) Gruppe via AK Golf ⇒ gratis app.
  if (user.groupMembershipsCount > 0) return "PRO";
  // (d) Prøveperiode: 30 dager fra registrering.
  const proveSlutt = user.createdAt.getTime() + PROVEPERIODE_DAGER * 86_400_000;
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
