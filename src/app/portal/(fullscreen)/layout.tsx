// Fullscreen layout for Live Session og andre tapper-moduser.
// Overstyrer PortalShell — ingen sidebar, ingen header.
// Auth-sjekk skjer i hver page.tsx via requirePortalUser.
//
// kreverTilgang: "INGEN" er BEVISST (17.08.2026) — samme feil som rot-layouten
// hadde, ett hakk lenger ned. Uten den arvet layouten FULL-defaulten og stengte
// /portal/tren/tester/[testId]/gjennomfor, som talent-allowlisten HAR åpnet:
// selve test-gjennomføringen, altså kjernen i den gratis talentprofilen. Siden
// var korrekt merket kreverTilgang: "TALENT", men layouten over den overstyrte.
// TILGANGSNIVÅET EIES AV HVER SIDE (fail-closed: en ny side uten kreverTilgang
// arver FULL-defaulten fra requirePortalUser).
// Rutekontrakten: src/lib/auth/talent-allowlist.ts
// Regresjonsvakt: src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ensurePortalPlayerViewMode } from "@/lib/view-mode";

export default async function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "GUEST"],
    kreverTilgang: "INGEN",
  });
  await ensurePortalPlayerViewMode(user.role);

  return <div className="min-h-dvh bg-foreground">{children}</div>;
}
