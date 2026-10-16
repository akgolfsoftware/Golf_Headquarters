/**
 * Innsikt og talent — AG-22 i Precision Athletics (/innsyn/talent/radar).
 *
 * Én samlet adresse for talentradar mot peer-snitt, discovery og WAGR-import.
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG22InnsiktTalent).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG22InnsiktTalent } from "@/components/admin/precision/AG22InnsiktTalent";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innsikt og talent · AgencyOS" };

export default async function TalentRadarPage({
  searchParams,
}: {
  searchParams?: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = searchParams ? await searchParams : {};

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG22InnsiktTalent tilstand="tom" startFane={sp.fane ?? "radar"} />
    </AgencyOSSkall>
  );
}
