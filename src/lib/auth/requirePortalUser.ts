// Server-side guard for beskyttede sider. Redirector hvis ikke innlogget,
// mangler tillatt rolle, eller venter på foreldresamtykke (GDPR art. 8).

import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { canAccessPortalRoute } from "./cbac";
import { isAwaitingGuardianConsent } from "./minor";
import type { UserRole } from "@/generated/prisma/client";

type Options = {
  allow?: UserRole | UserRole[];
  redirectTo?: string;
  /**
   * Sett til true for å tillate brukere som venter på foreldresamtykke.
   * Standard: false — slike brukere sendes til /auth/samtykke-venter.
   * Brukes ikke per nå, men eksponeres for fremtidig fleksibilitet.
   */
  allowAwaitingConsent?: boolean;
};

export async function requirePortalUser(options: Options = {}) {
  const { allow, redirectTo = "/auth/login", allowAwaitingConsent = false } = options;
  // P0-4 (GDPR): getCurrentUser er eneste innloggings-sti for portal/admin og
  // returnerer null for soft-slettet konto (deletedAt satt) — så !user-redirecten
  // under stenger slettede kontoer ute. Ikke dupliser deletedAt-sjekken her: user
  // kan aldri ha deletedAt satt på dette punktet (ville vært død kode).
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  if (allow && !canAccessPortalRoute(user.role, allow)) {
    // Send brukere til riktig "hjemmeside" basert på rolle for å unngå loops.
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }
  // S-13: GDPR art. 8 — mindreårig spiller uten foreldresamtykke
  // sendes til venterom-side i stedet for portalen.
  if (!allowAwaitingConsent && isAwaitingGuardianConsent(user)) {
    redirect("/auth/samtykke-venter");
  }
  return user;
}
