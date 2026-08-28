/**
 * Miljøkonfigurasjon for Saker-innsamlerne (Jarvis steg 2). Defensivt: alt har
 * fornuftige defaults, ingen ny env-oppsett trengs utover en eksisterende
 * ADMIN Google-tilkobling (samme som Meg-boten/mulligan-triage bruker).
 */

export const SAKER_GMAIL_QUERY_DEFAULT = "in:inbox is:unread newer_than:2d -from:me";
/** Fallback når JarvisInnstilling.slaTerskelTimer ikke kan leses. Live-kode bruker innstillingene. */
export const SAKER_SLA_TIMER = 6;
export const SAKER_TRIAGE_BATCH_LIMIT_DEFAULT = 20;

export type SakerInnsamlingEnv = {
  /**
   * Gmail-søket som avgjør hvilke e-poster som vurderes denne kjøringen.
   * Default er bevisst bredt (uleste, siste 2 døgn, i innboks, ekskluderer
   * egne utsendte) — snevre inn med et faktisk relevant søk/label når behovet
   * er kjent (samme mønster som MULLIGAN_GMAIL_QUERY).
   */
  gmailQuery: string;
  /**
   * Maks antall VENTER-saker uten foreslattSvar triage.ts behandler i ÉN
   * kjøring (steg 3). Holder en enkeltkjøring rask og forutsigbar selv om
   * køen har bygget seg opp — resten tas neste kjøring (30 min senere).
   */
  triageBatchLimit: number;
};

export function lesSakerInnsamlingEnv(): SakerInnsamlingEnv {
  const batchLimit = Number(process.env.SAKER_TRIAGE_BATCH_LIMIT);
  return {
    gmailQuery: process.env.SAKER_GMAIL_QUERY ?? SAKER_GMAIL_QUERY_DEFAULT,
    triageBatchLimit: Number.isFinite(batchLimit) && batchLimit > 0 ? batchLimit : SAKER_TRIAGE_BATCH_LIMIT_DEFAULT,
  };
}
