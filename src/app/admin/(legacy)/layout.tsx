import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { GlobalSearchModal } from "@/components/admin/global-search-modal";

// Legacy-flater under /admin — 2026-07-12: rendres nå i V2Shell (samme
// AgencyOS-chrome som de porterte sidene: ikon-rail med etiketter + Mer-meny +
// full bredde) i stedet for gamle AdminShell (sidebar/topbar med scope-velger).
// Innholdet er allerede retunet mørkt (golfdata-scope beholdes for tokens);
// selve flatene rekomponeres til v2 bølgevis per plans/legacy-portering-prioritet.md.
// Global Cmd+K-søk beholdes (selvstendig klient-modal).
// Auth-guarden ligger i src/app/admin/layout.tsx (toppen).
export default async function AdminLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div className="golfdata-scope">{children}</div>
      <GlobalSearchModal />
    </V2Shell>
  );
}
