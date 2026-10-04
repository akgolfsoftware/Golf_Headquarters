/**
 * AgencyOS · AK-stigen (AG-16b, Precision Athletics). Fire trinn, Knøtt og
 * WANG ved siden av. Data fra lastAkStigenData().
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG16bAkStigen } from "@/components/admin/precision/AG16bAkStigen";
import { lastAkStigenData } from "@/lib/agencyos/ak-stigen-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "AK-stigen · AgencyOS" };

export default async function AkStigenPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await lastAkStigenData();
  const tom = Object.keys(data.grupper).length === 0 && data.vedSidenAv.length === 0;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG16bAkStigen tilstand={tom ? "tom" : "data"} data={data} />
    </AgencyOSSkall>
  );
}
