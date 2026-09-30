/**
 * AgencyOS Hjelp (AG-24, Precision Athletics). Statisk innhold, ingen
 * Prisma-spørringer. Auth via requirePortalUser (COACH/ADMIN), som før.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG24Hjelp } from "@/components/admin/precision/AG24Drift";

export const metadata = { title: "Hjelp · AgencyOS" };

export default async function V2AdminHjelpPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG24Hjelp />
    </AgencyOSSkall>
  );
}
