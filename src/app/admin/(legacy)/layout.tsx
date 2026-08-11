import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";

/**
 * AgencyOS under /admin/(legacy) — én V2Shell (Paper chrome).
 * IKKE .golfdata-scope her: den overstyrte Paper-tokens (--p- og --v2-) inni innholdet.
 * Athletic/golfdata-widgets som *trenger* scope wrapper lokalt i egen komponent.
 * IKKE nest V2Shell i child pages (layout eier chrome).
 * GlobalSearchModal eies av V2Shell (Agency) — ikke monter her (dobbel modal).
 */
export default async function AdminLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return (
    <V2Shell
      bredde="full"
      nav={AGENCYOS_NAV}
      navn={user.name ?? "Coach"}
      avatarUrl={user.avatarUrl}
    >
      {children}
    </V2Shell>
  );
}
