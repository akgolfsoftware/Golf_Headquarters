/**
 * Mindreårig-helper for GDPR art. 8 (P17).
 *
 * Norsk lov: 16 år er aldersgrensen for å samtykke selv til behandling
 * av persondata. Under 16 år krever foreldresamtykke.
 *
 * Brukes:
 *  - Ved onboarding: hvis dateOfBirth < 16 år → sett requiresGuardianConsent
 *  - I PortalShell: vis banner hvis requiresGuardianConsent + ikke gitt
 *  - I forelder-portal: ParentInvitation-flyt + signering
 */

const GDPR_AGE_THRESHOLD = 16;

/**
 * Returnerer true hvis fødselsdato indikerer at brukeren er < 16 år.
 * Returnerer false hvis dateOfBirth er null/undefined (anta voksen).
 */
export function isMinor(dateOfBirth: Date | null | undefined): boolean {
  if (!dateOfBirth) return false;
  const now = new Date();
  const ageMs = now.getTime() - dateOfBirth.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears < GDPR_AGE_THRESHOLD;
}

/**
 * Returnerer brukerens alder i hele år.
 */
export function calculateAge(dateOfBirth: Date | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const m = now.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
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
