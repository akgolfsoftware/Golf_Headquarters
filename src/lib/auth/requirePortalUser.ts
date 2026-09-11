// Server-side guard for beskyttede sider. Redirector hvis ikke innlogget,
// mangler tillatt rolle, eller venter på foreldresamtykke (GDPR art. 8).

import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "./getCurrentUser";
import { canAccessPortalRoute } from "./cbac";
import { isAwaitingGuardianConsent } from "./minor";
import { erTilgangHentefeil } from "./tilgang-hentefeil";
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
  /**
   * Minste tilgangsnivå siden krever (plan T2, FAIL-CLOSED):
   *   "FULL"   (default) — betalende/gratis-full; TALENT og INGEN sendes til
   *            oppgraderingssiden. En NY side er dermed låst til den
   *            eksplisitt åpnes.
   *   "TALENT" — åpen for den låste gratisprofilen (tester, stats, SG-
   *            registrering, datagolf, talent, booking — talent-allowlist.ts
   *            er rutekontrakten e2e verifiserer mot).
   *   "INGEN"  — alle innloggede (konto-/betalingssider: oppgraderingsveien
   *            MÅ alltid være nåbar).
   * Gjelder kun PLAYER — coach/admin/forelder har egne flater og rammes ikke.
   */
  kreverTilgang?: "FULL" | "TALENT" | "INGEN";
};

export async function requirePortalUser(options: Options = {}) {
  const {
    allow,
    redirectTo = "/auth/login",
    allowAwaitingConsent = false,
    kreverTilgang = "FULL",
  } = options;
  let user;
  try {
    user = await getCurrentUserRaw();
  } catch (e) {
    if (erTilgangHentefeil(e)) redirect("/auth/tjeneste-utilgjengelig");
    throw e;
  }
  if (!user) redirect(redirectTo);
  if (allow && !canAccessPortalRoute(user.role, allow)) {
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }
  if (!allowAwaitingConsent && isAwaitingGuardianConsent(user)) {
    redirect("/auth/samtykke-venter");
  }
  if (user.role === "PLAYER") {
    const nivaa = user.tilgang.nivaa;
    if (nivaa === "INGEN" && kreverTilgang !== "INGEN") {
      redirect("/portal/oppgrader");
    }
    if (nivaa === "TALENT" && kreverTilgang === "FULL") {
      redirect("/portal/oppgrader?fra=laast");
    }
  }
  return user;
}
