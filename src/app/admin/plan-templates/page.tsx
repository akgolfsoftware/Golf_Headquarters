/**
 * /admin/plan-templates — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/plan-templates.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlanTemplatesScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function PlanTemplatesPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <PlanTemplatesScreen />;
}
