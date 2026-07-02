// Samtykke-guard for SERVER ACTIONS (GDPR art. 8).
//
// Sidene beskyttes av `requirePortalUser`, som sender en mindreårig spiller
// uten foreldresamtykke til venterom. Men server-actions kan POST-es direkte,
// utenom side-vakten. Disse guardene lukker det hullet for actions der en
// spiller endrer egne data.
//
// Trygg no-op for voksne/coach/parent: kun mindreårige får
// `requiresGuardianConsent`, så `isAwaitingGuardianConsent` er false for alle
// andre.

import type { User } from "@/generated/prisma/client";
import { isAwaitingGuardianConsent } from "./minor";

/**
 * Hent innlogget bruker og krev at ev. foreldresamtykke er gitt.
 * Kaster `unauthenticated` hvis ikke innlogget, `guardian-consent-required`
 * hvis en mindreårig venter på foreldresamtykke. Erstatter mønsteret
 * `getCurrentUser()` + `if (!user) throw new Error("unauthenticated")`.
 *
 * Lazy import av getCurrentUser: unngår at bare det å importere
 * `assertNotAwaitingConsent` (ren funksjon, testes isolert) drar inn
 * next/navigation via getCurrentUser sin redirect-logikk.
 */
export async function requireConsentingUser(): Promise<User> {
  const { getCurrentUser } = await import("./getCurrentUser");
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (isAwaitingGuardianConsent(user)) {
    throw new Error("guardian-consent-required");
  }
  return user;
}

/**
 * Void-variant for actions med egen null-håndtering (f.eks. `return { ok:false }`).
 * Kall etter den eksisterende null-sjekken — kaster kun hvis en innlogget,
 * mindreårig bruker mangler foreldresamtykke.
 */
export function assertNotAwaitingConsent(
  user: { requiresGuardianConsent: boolean; guardianConsentGivenAt: Date | null },
): void {
  if (isAwaitingGuardianConsent(user)) {
    throw new Error("guardian-consent-required");
  }
}
