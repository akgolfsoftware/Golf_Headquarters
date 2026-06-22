// Server-side guard som gater på en CBAC-capability i stedet for rå rolle.
// Brukes der policyen bor i cbac.ts (f.eks. VIEW_FINANCE = kun ADMIN), så
// håndhevingen matcher matrisen som vises i /admin/settings/tilgang.

import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { can, type Capability } from "./cbac";
import { isAwaitingGuardianConsent } from "./minor";

type Options = {
  redirectTo?: string;
};

/**
 * Krever at innlogget bruker har `capability`. Redirecter til login hvis ikke
 * innlogget, til rolle-hjemmeside hvis capability mangler, og til
 * samtykke-venterom for mindreårig uten foreldresamtykke (samme som
 * requirePortalUser). Returnerer brukeren ved suksess.
 */
export async function requireCapability(
  capability: Capability,
  options: Options = {},
) {
  const { redirectTo = "/auth/login" } = options;
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  if (!can(user.role, capability)) {
    // Send til riktig hjemmeside basert på rolle for å unngå redirect-loops.
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }
  // GDPR art. 8 — mindreårig spiller uten foreldresamtykke sendes til venterom.
  if (isAwaitingGuardianConsent(user)) {
    redirect("/auth/samtykke-venter");
  }
  return user;
}
