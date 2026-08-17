import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";

/**
 * PlayerHQ under /portal/(legacy) — V2Shell Paper chrome (erstatter gammel PortalShell).
 * Topp /portal/layout.tsx gir auth + providers uten chrome.
 * Child pages MÅ IKKE wrappe ny V2Shell (dobbel rail/bunn-nav).
 *
 * kreverTilgang: "INGEN" er BEVISST (17.08.2026) — samme feil som rot-layouten
 * hadde, ett hakk lenger ned. Uten den arvet layouten FULL-defaulten og stengte
 * fire ruter som talent-allowlisten HAR åpnet (/portal/statistikk,
 * /portal/tren/tester/katalog og de to /portal/mal/runder-aliasene): en
 * TALENT-bruker ble sendt til oppgraderingssiden for flater han faktisk har
 * tilgang til. Layouten er bare chrome — den skal ikke eie tilgangsnivået.
 * TILGANGSNIVÅET EIES AV HVER SIDE (fail-closed: en ny side uten
 * kreverTilgang arver FULL-defaulten fra requirePortalUser).
 * Rutekontrakten: src/lib/auth/talent-allowlist.ts
 * Regresjonsvakt: src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts
 */
export default async function PortalLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "GUEST"],
    kreverTilgang: "INGEN",
  });
  return (
    <V2Shell
      bredde="kolonne"
      nav={PLAYERHQ_NAV}
      navn={user.name ?? undefined}
      avatarUrl={user.avatarUrl}
    >
      {children}
    </V2Shell>
  );
}
