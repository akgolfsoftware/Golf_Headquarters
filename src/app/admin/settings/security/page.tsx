/**
 * AgencyOS — Innstillinger · Sikkerhet (`/admin/settings/security`), v2.
 * Port av `(legacy)/settings/security/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.33).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminInnstillingerSikkerhetV2 } from "@/components/admin/v2/AdminInnstillingerSikkerhetV2";

export default async function AdminSecurityPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sistOppdatertTekst = user.updatedAt.toLocaleString("nb-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminInnstillingerSikkerhetV2 rolle={user.role} epost={user.email} sistOppdatertTekst={sistOppdatertTekst} />
    </V2Shell>
  );
}
