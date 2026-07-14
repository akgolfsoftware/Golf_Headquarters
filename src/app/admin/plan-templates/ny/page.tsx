/**
 * AgencyOS — Ny plan-mal (`/admin/plan-templates/ny`), v2.
 * Port av `(legacy)/plan-templates/ny/page.tsx` (2026-07-14, AgencyOS
 * Bølge 1.5) — samme `createTemplate`-kontrakt, ny v2-presentasjon i
 * `AdminPlanMalNyV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminPlanMalNyV2 } from "@/components/admin/v2/AdminPlanMalNyV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny plan-mal · AgencyOS (v2)" };

export default async function NyPlanTemplatePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminPlanMalNyV2 />
    </V2Shell>
  );
}
