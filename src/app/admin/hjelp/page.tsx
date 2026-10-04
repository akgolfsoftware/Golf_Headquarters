/**
 * Hjelp — AG-24 i Precision Athletics (/admin/hjelp).
 *
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG24Drift startFane="hjelp").
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG24Drift } from "@/components/admin/precision/AG24Drift";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hjelp · AgencyOS" };

export default async function AdminHjelpPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG24Drift startFane="hjelp" />
    </AgencyOSSkall>
  );
}
