// Server-side guard for beskyttede sider. Redirector hvis ikke innlogget,
// mangler tillatt rolle, eller venter på foreldresamtykke (GDPR art. 8).

import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "./getCurrentUser";
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
  // P0-4 (GDPR): getCurrentUser er eneste innloggings-sti for portal/admin og
  // returnerer null for soft-slettet konto (deletedAt satt) — så !user-redirecten
  // under stenger slettede kontoer ute. Ikke dupliser deletedAt-sjekken her: user
  // kan aldri ha deletedAt satt på dette punktet (ville vært død kode).
  // Bruker getCurrentUserRaw fordi denne guarden gjør sin EGEN samtykke-redirect
  // under (med allowAwaitingConsent-flagget) — getCurrentUser ville redirecte
  // ubetinget og gjort allowAwaitingConsent-flagget dødt.
  const user = await getCurrentUserRaw();
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
  // T2: tilgangsnivå-gaten (kun spillere — coach/admin har egne flater).
  // gratisForAlle-vinduet gir alle FULL frem til 1. september, så gaten er
  // i praksis sovende til da (resolveTilgang eier den logikken).
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
