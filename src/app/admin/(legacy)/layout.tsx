import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminSkallVelger } from "@/components/precision/AdminSkallVelger";

/**
 * AgencyOS under /admin/(legacy) — én V2Shell (Paper chrome), unntatt sider
 * portert til Precision Athletics, som har AgencyOSSkall selv (AdminSkallVelger).
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
    <AdminSkallVelger navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      {children}
    </AdminSkallVelger>
  );
}
