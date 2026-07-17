/**
 * PlayerHQ · Putte-laboratoriet (/portal/trening/putte-laboratoriet) — v2.
 * v2-port 17. juli 2026 (Team D2): `PutteLabV2` erstatter legacy
 * putte-lab-client, ruten flyttet ut av (legacy). All putt-fysikk/-sannsynlighet
 * kommer fortsatt uendret fra @/lib/putt-core — kun presentasjonslaget er nytt
 * (og legacy-filens 25 rå hex er borte).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { PutteLabV2 } from "@/components/portal/v2/PutteLabV2";

export const dynamic = "force-dynamic";

export default async function PutteLaboratorietPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <PutteLabV2 />
    </V2Shell>
  );
}
