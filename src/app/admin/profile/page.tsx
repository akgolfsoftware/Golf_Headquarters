/**
 * Profil & konto — AG-23 i Precision Athletics (/admin/profile).
 *
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG23Oppsett startFane="profil").
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG23Oppsett } from "@/components/admin/precision/AG23Oppsett";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil · AgencyOS" };

export default async function AdminProfilePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG23Oppsett startFane="profil" />
    </AgencyOSSkall>
  );
}
