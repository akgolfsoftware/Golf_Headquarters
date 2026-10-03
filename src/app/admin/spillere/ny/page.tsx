/**
 * AgencyOS — Ny spiller (`/admin/spillere/ny`) i Precision Athletics
 * (30.09.2026, AG-07-NY). Samme tilgang (ADMIN/COACH) og samme server action
 * (`createSpiller`) som Train-lock-veiviseren; siden har ingen loader, så
 * skjemaet er selve tomtilstanden. Skallet er AgencyOSSkall (Hurtigknappen).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG07Ny } from "@/components/admin/precision/AG07Ny";

export const dynamic = "force-dynamic";

export default async function NySpillerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG07Ny />
    </AgencyOSSkall>
  );
}
