/**
 * AgencyOS · Caddie · Dashbord (/admin/agencyos/caddie/dashbord)
 *
 * Co-agent-rammeverket: utkast-til-godkjenning + agent-fleet + audit-logg,
 * fra ekte data (PlanAction / AgentRun / AuditLog) via loadCoAgent. ADMIN-only.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CoAgent } from "@/components/admin/caddie/co-agent";
import { loadCoAgent } from "@/lib/admin-caddie/co-agent-data";

export const dynamic = "force-dynamic";

export default async function CaddieDashbordPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const props = await loadCoAgent({ id: user.id, name: user.name });
  return <CoAgent {...props} />;
}
