/**
 * Miljøkonfigurasjon for Saker-innsamlerne (Jarvis steg 2). Defensivt: alt har
 * fornuftige defaults, ingen ny env-oppsett trengs utover en eksisterende
 * ADMIN Google-tilkobling (samme som Meg-boten/mulligan-triage bruker).
 */

export const SAKER_GMAIL_QUERY_DEFAULT = "in:inbox is:unread newer_than:2d -from:me";
export const SAKER_SLA_TIMER = 6;

export type SakerInnsamlingEnv = {
  /**
   * Gmail-søket som avgjør hvilke e-poster som vurderes denne kjøringen.
   * Default er bevisst bredt (uleste, siste 2 døgn, i innboks, ekskluderer
   * egne utsendte) — snevre inn med et faktisk relevant søk/label når behovet
   * er kjent (samme mønster som MULLIGAN_GMAIL_QUERY).
   */
  gmailQuery: string;
};

export function lesSakerInnsamlingEnv(): SakerInnsamlingEnv {
  return {
    gmailQuery: process.env.SAKER_GMAIL_QUERY ?? SAKER_GMAIL_QUERY_DEFAULT,
  };
}
