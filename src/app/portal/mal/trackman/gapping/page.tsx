/**
 * PlayerHQ · Gapping (D5).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-gapping.html
 *
 * Ligger under TrackMan fordi tallene kommer derfra — fasiten lenker tilbake
 * til TrackMan-lista. Leser kun.
 */

import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentGapping } from "@/lib/portal/gapping-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { GappingV2 } from "@/components/portal/v2/GappingV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gapping · PlayerHQ" };

export default async function GappingPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentGapping(user.id);

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="analyse"
      nav={PLAYERHQ_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <GappingV2 data={data} />
    </V2Shell>
  );
}
