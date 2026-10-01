/**
 * AgencyOS — Ny plan-mal (/admin/plan-templates/ny) i Precision Athletics,
 * under Plan-hub (AG-14). Auth-guard og createTemplate-handlingen er
 * uendret; visningen er AG14MalNy i AgencyOSSkall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG14MalNy } from "@/components/admin/precision/AG14MalNy";

export const dynamic = "force-dynamic";

export default async function NyPlanTemplate() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG14MalNy />
    </AgencyOSSkall>
  );
}
