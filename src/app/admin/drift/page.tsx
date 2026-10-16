/**
 * Drift — AG-24 i Precision Athletics (/admin/drift).
 *
 * Én samlet adresse for revisjonslogg, feillogg, sletteforespørsler (GDPR) og hjelp.
 * Kun synlig for administratorer.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG24Drift } from "@/components/admin/precision/AG24Drift";
import { lastDriftData } from "@/lib/admin/drift/last-drift-data";
import { godkjennGdprForesporsel, utforGdprForesporsel } from "@/app/admin/drift/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drift · AgencyOS" };

export default async function AdminDriftPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const { fane } = await searchParams;

  return (
    <AgencyOSSkall navn={user.name ?? "Admin"}>
      <AG24Drift data={await lastDriftData()} onGodkjenn={godkjennGdprForesporsel} onSlettData={utforGdprForesporsel} startFane={fane ?? "gdpr"} />
    </AgencyOSSkall>
  );
}
