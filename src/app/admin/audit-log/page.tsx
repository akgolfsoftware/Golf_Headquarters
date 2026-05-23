/**
 * /admin/audit-log — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/audit-log.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AuditLogScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <AuditLogScreen />;
}
