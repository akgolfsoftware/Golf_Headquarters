/**
 * Revisjonslogg — AG-24 i Precision Athletics (/admin/audit-log).
 *
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG24Drift startFane="audit").
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG24Drift } from "@/components/admin/precision/AG24Drift";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revisjonslogg · AgencyOS" };

export default async function AuditLogPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Admin"}>
      <AG24Drift startFane="audit" />
    </AgencyOSSkall>
  );
}
