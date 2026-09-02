import { PortalProviders } from "@/components/portal/portal-providers";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { registrerDagligAktivitet } from "@/lib/analytics/daglig-aktivitet";

// TOPP-layout for /portal — auth-guard (Phase 0 security) + providers.
// INGEN visuell chrome (sidebar/topbar/BottomNav).
// v2-migrerte flater eier egen chrome (V2Shell). Legacy får PortalShell via
// src/app/portal/(legacy)/layout.tsx.
//
// Defense in depth: root requires login. Pages still call requirePortalUser
// for role-specific redirects (PARENT → /forelder, etc.).
//
// kreverTilgang: "INGEN" er BEVISST (16.08.2026). Denne layouten wrapper HELE
// /portal, inkludert /portal/oppgrader — så håndhevet den FULL (defaulten),
// ble en TALENT-bruker sendt til oppgraderingssiden, som traff samme layout og
// sendte ham videre igjen: redirect-løkke. Alle kreverTilgang: "TALENT"-
// merkingene lenger nede i treet var dermed unåelige.
// Rot-laget håndhever derfor kun innlogging, rolle og foreldresamtykke.
// TILGANGSNIVÅET EIES AV HVER SIDE — en ny side arver FULL-defaulten fra
// requirePortalUser og er låst til noen åpner den bevisst.
// Rutekontrakten: src/lib/auth/talent-allowlist.ts
// Regresjonsvakt: src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  // STEG 16.3 (bruksmåling): én rad per bruker per Oslo-dag, skrevet ved hver
  // innlasting av /portal. Idempotent (upsert), feiler aldri sidevisningen.
  await registrerDagligAktivitet(user.id);
  return <PortalProviders>{children}</PortalProviders>;
}
