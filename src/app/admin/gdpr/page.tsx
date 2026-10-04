/**
 * GDPR-kø — AG-24 i Precision Athletics (/admin/gdpr).
 *
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG24Drift startFane="gdpr").
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG24Drift } from "@/components/admin/precision/AG24Drift";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "GDPR-kø · AgencyOS",
};

export default async function GdprKoPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Admin"}>
      <AG24Drift startFane="gdpr" />
    </AgencyOSSkall>
  );
}
