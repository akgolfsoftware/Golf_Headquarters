/**
 * AgencyOS — Ny plan-mal v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/plan-templates/ny (`NewTemplateForm`) — samme
 * server action `createTemplate` (uendret i (legacy)/plan-templates/actions.ts).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminPlanMalOpprettV2 } from "@/components/admin/v2/AdminPlanMalOpprettV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny plan-mal · AgencyOS" };

export default async function AdminPlanMalNyPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/plan-templates">Plan-maler</TilbakeLenke>
      <AdminPlanMalOpprettV2 />
    </V2Shell>
  );
}
