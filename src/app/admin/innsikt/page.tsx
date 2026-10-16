/**
 * Innsikt og talent — AG-22 i Precision Athletics (/admin/innsikt).
 *
 * Talentradar mot peer-snitt, discovery og WAGR-import for coacher og admin.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG22InnsiktTalent } from "@/components/admin/precision/AG22InnsiktTalent";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innsikt og talent · AgencyOS" };

export default async function AdminInnsiktPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane } = await searchParams;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG22InnsiktTalent tilstand="tom" startFane={fane ?? "radar"} />
    </AgencyOSSkall>
  );
}
