/**
 * Delte dato-helpers (Bølge 8, 2026-07-13 — feilfiks-plan 4.1).
 *
 * Turneringsdatoer lagres som ren dato (midnatt UTC). Filtre av typen
 * `startDate: { gte: new Date() }` mistet derfor DAGENS turnering i det
 * klokka passerte midnatt UTC — turneringen «forsvant» fra spillerens
 * signaler/plan samme dag den spilles. Sammenlign alltid mot dagens
 * UTC-midnatt i «kommende turneringer»-filtre.
 */

/** Dagens dato ved midnatt UTC — for gte-filtre mot rene dato-felt. */
export function dagensStartUTC(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
