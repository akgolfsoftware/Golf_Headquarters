// Tilgangsregler for PlayerHQ (v2 siden plan A3, 2026-08-16).
//
// LÅSTE forretningsregler (BUSINESS-RULES.md + Anders' beslutninger 2026-08-16):
// PlayerHQ har tre tilgangsnivåer:
//   FULL   — hele appen. Gratis for (a) lanserings-vinduet (alle frem til
//            1. september 2026), (b) betalt PlayerHQ-abonnement (299 kr/mnd
//            eller 2 690 kr/år), (c) aktiv coaching-pakke (Performance /
//            Performance Pro — også CANCELLED med resttid: tilgangen følger
//            pakken UT perioden), (d) aktivt spiller-medlemskap i AK Golf-
//            administrert gruppe (GFGK, WANG, WANG UNG, Academy, Junior
//            Academy), (e) prøveperiode (trialEndsAt, ellers 7 dager fra
//            registrering).
//   TALENT — gratis, låst TalentHQ-profil (User.profilType = "TALENT"):
//            kun tester, stats-lesing, SG-/runderegistrering, DataGolf-
//            sammenligning, talent-flatene, booking og konto. Utløper aldri.
//   INGEN  — må betale (eller registrere TalentHQ-profil).
//
// "Effektiv tier": PRO = FULL tilgang · GRATIS = ikke FULL. Beregnes ETT sted
// (lib/auth/getCurrentUser withEffektivTilgang) og overskriver user.tier slik
// at eksisterende gates (som leser user.tier) fungerer uendret. Nivået
// (FULL/TALENT/INGEN) håndheves sentralt i requirePortalUser (plan T2).
// /portal/meg/abonnement viser FAKTISK tier ved å lese prisma.user direkte.

import type { Tier, SubscriptionStatus } from "@/generated/prisma/client";
import { harAktivPakke, girPlayerHqTilgang } from "@/lib/domain/abonnement";

// Betaling starter 1. september 2026 (Europe/Oslo). Frem til da har ALLE full tilgang.
const BETALING_STARTER = new Date("2026-09-01T00:00:00.000+02:00");
// Én ukes prøveperiode (Anders 2026-08-29). Var 30 dager frem til betalingen
// ble slått på — kortet ned da abonnement ble hovedinntektsmodellen.
const PROVEPERIODE_DAGER = 7;

export function gratisForAlle(now: Date = new Date()): boolean {
  return now.getTime() < BETALING_STARTER.getTime();
}

export type TilgangsNivaa = "FULL" | "TALENT" | "INGEN";

export type TilgangsKilde =
  | "LANSERING"
  | "PLAYERHQ_ABONNEMENT"
  | "COACHING_PAKKE"
  | "AK_GRUPPE"
  | "PROVEPERIODE"
  | "TALENT_PROFIL"
  | "INGEN";

export interface Tilgang {
  nivaa: TilgangsNivaa;
  kilde: TilgangsKilde;
  /** PRO = FULL tilgang, GRATIS = ikke FULL — det gamle tier-språket. */
  effektivTier: Tier;
}

/**
 * Bruker-formet input til resolveTilgang — nøyaktig det som trengs.
 * Lastes av withEffektivTilgang (lib/auth/getCurrentUser).
 */
export type ResolveTilgangInput = {
  /** Faktisk tier fra DB. PRO = betaler (settes av Stripe-webhooken). */
  tier: Tier;
  /** STANDARD | TALENT (User.profilType). */
  profilType: string;
  /** Registreringsdato — prøveperiode-fallback (createdAt + 30 dager). */
  createdAt: Date;
  /** Eksplisitt prøveperiode-utløp (User.trialEndsAt) — vinner over createdAt. */
  trialEndsAt?: Date | null;
  /** COACHING-raden (Performance/Pro). null hvis ingen. */
  coaching?: {
    status: SubscriptionStatus;
    monthlyCredits: number;
    currentPeriodEnd: Date | null;
  } | null;
  /** PLAYERHQ-raden. null hvis ingen. */
  playerhq?: {
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
    plan: string | null;
    stripeSubscriptionId: string | null;
  } | null;
  /** Antall AKTIVE spiller-medlemskap i AK Golf-administrerte grupper
   *  (aktivtAkGruppeMedlemskapWhere fra src/lib/domain/grupper.ts). */
  akGruppeCount: number;
  /** Overstyr "nå" (test/SSR-determinisme). */
  now?: Date;
};

/**
 * Eneste sannhetskilde for effektiv PlayerHQ-tilgang. Regelrekkefølgen er
 * bevisst: sterkeste kilde vinner, og TALENT ligger NEST SIST — en
 * TalentHQ-profil som kjøper abonnement eller meldes inn i gruppe får FULL
 * automatisk uten at profilType røres.
 */
export function resolveTilgang(user: ResolveTilgangInput): Tilgang {
  const now = user.now ?? new Date();
  const full = (kilde: TilgangsKilde): Tilgang => ({ nivaa: "FULL", kilde, effektivTier: "PRO" });

  // (a) Lanserings-vindu: ALLE har full tilgang frem til 1. september 2026.
  if (gratisForAlle(now)) return full("LANSERING");
  // (b) Betalt PlayerHQ-abonnement (mnd/år, TRIALING-broen, MANUELL).
  if (user.playerhq && girPlayerHqTilgang(user.playerhq, now)) {
    return full("PLAYERHQ_ABONNEMENT");
  }
  // Betaler-flagget på brukeren (settes av webhooken fra ALLE rader) — fanger
  // manuelt PRO-satte brukere uten gyldig abonnementsrad.
  if (user.tier !== "GRATIS") return full("PLAYERHQ_ABONNEMENT");
  // (c) Coaching-pakke — OGSÅ oppsagt med resttid: tilgang ut perioden.
  if (
    user.coaching &&
    user.coaching.monthlyCredits > 0 &&
    harAktivPakke(user.coaching, now)
  ) {
    return full("COACHING_PAKKE");
  }
  // (d) Aktivt spiller-medlemskap i AK Golf-administrert gruppe.
  if (user.akGruppeCount > 0) return full("AK_GRUPPE");
  // (e) Prøveperiode: trialEndsAt vinner; ellers createdAt + 7 dager.
  const proveSlutt =
    user.trialEndsAt?.getTime() ??
    user.createdAt.getTime() + PROVEPERIODE_DAGER * 86_400_000;
  if (now.getTime() < proveSlutt) return full("PROVEPERIODE");
  // TalentHQ-profilen: gratis, låst, utløper aldri.
  if (user.profilType === "TALENT") {
    return { nivaa: "TALENT", kilde: "TALENT_PROFIL", effektivTier: "GRATIS" };
  }
  return { nivaa: "INGEN", kilde: "INGEN", effektivTier: "GRATIS" };
}

/**
 * Bakoverkompatibel wrapper — alle eksisterende gates leser tier.
 * PRO = FULL tilgang (gratis ELLER betalt), GRATIS = ikke FULL.
 */
export type ResolveTierInput = ResolveTilgangInput;

export function resolveTier(user: ResolveTierInput): Tier {
  return resolveTilgang(user).effektivTier;
}

/** Banner-info: gratis for alle frem til betaling starter 1. september. */
export const PRO_KAMPANJE_INFO = {
  aktiv: gratisForAlle(),
  utlopISO: BETALING_STARTER.toISOString(),
  utlopFormatted: BETALING_STARTER.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
};
