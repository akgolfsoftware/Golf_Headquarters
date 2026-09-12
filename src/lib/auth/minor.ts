/**
 * Mindreårig-helper for GDPR art. 8 (P17).
 *
 * Norsk lov: 16 år er aldersgrensen for å samtykke selv til behandling
 * av persondata. Under 16 år krever foreldresamtykke. Grensen byttes
 * ikke automatisk til 13.
 *
 * Brukes:
 *  - Ved onboarding: hvis dateOfBirth < 16 år → sett requiresGuardianConsent
 *  - I PortalShell: vis banner hvis requiresGuardianConsent + ikke gitt
 *  - I forelder-portal: ParentInvitation-flyt + signering
 *  - Helse- og delingssamtykke: samme 16-årsregel, strengeste signal vinner
 */

/** Norsk art. 8-grense. Ikke endre til 13 uten ny beslutning. */
export const GDPR_SAMTYKKE_ALDER = 16;

export type SamtykkeGiver = {
  /** Flagg satt ved onboarding eller av foresatt. */
  requiresGuardianConsent: boolean;
  /** Fødselsdato, hvis vi har den. */
  dateOfBirth: Date | null;
};

/**
 * Alder i hele år på et gitt tidspunkt. Kalenderalder, ikke 365,25-døgn.
 * Returnerer null hvis fødselsdato mangler.
 */
export function calculateAge(
  dateOfBirth: Date | null | undefined,
  naa: Date = new Date(),
): number | null {
  if (!dateOfBirth) return null;
  let age = naa.getFullYear() - dateOfBirth.getFullYear();
  const m = naa.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && naa.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

/**
 * True hvis fødselsdato indikerer under 16 år.
 * False hvis dateOfBirth er null/undefined (anta voksen).
 */
export function isMinor(
  dateOfBirth: Date | null | undefined,
  naa: Date = new Date(),
): boolean {
  const age = calculateAge(dateOfBirth, naa);
  return age !== null && age < GDPR_SAMTYKKE_ALDER;
}

/**
 * Kan spilleren gi samtykke selv, eller må en foresatt gjøre det?
 *
 * To uavhengige signaler, og vi stoler på det strengeste: flagget
 * `requiresGuardianConsent` og fødselsdatoen. Er ett av dem «under 16»,
 * må foresatt inn. Mangler begge, antar vi voksen.
 */
export function maaHaForesattSamtykke(
  bruker: SamtykkeGiver,
  naa: Date = new Date(),
): boolean {
  if (bruker.requiresGuardianConsent) return true;
  return isMinor(bruker.dateOfBirth, naa);
}

/**
 * Returnerer true hvis brukeren TRENGER samtykke MEN ikke har fått det enda.
 */
export function isAwaitingGuardianConsent(user: {
  requiresGuardianConsent: boolean;
  guardianConsentGivenAt: Date | null;
}): boolean {
  return user.requiresGuardianConsent && !user.guardianConsentGivenAt;
}
