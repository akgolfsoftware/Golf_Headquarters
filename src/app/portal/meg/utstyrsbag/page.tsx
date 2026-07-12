/**
 * v2 — PlayerHQ Meg · Utstyrsbag (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav), MegUtstyrsbagV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den tidligere /portal/meg/utstyrsbag-siden:
 * requirePortalUser (PLAYER/COACH/ADMIN) + EquipmentBag-oppslag. Ingen
 * fabrikerte verdier — tomme felter forblir tomme.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegUtstyrsbagV2, type MegUtstyrsbagData } from "@/components/portal/v2/MegUtstyrsbagV2";
import type { UtstyrsbagInput } from "./actions";

export const dynamic = "force-dynamic";

export default async function UtstyrsbagPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const bag = await prisma.equipmentBag.findUnique({ where: { userId: user.id } });

  const utstyr: UtstyrsbagInput = {
    driver: bag?.driver ?? undefined,
    fairwayWoods: bag?.fairwayWoods ?? undefined,
    hybrids: bag?.hybrids ?? undefined,
    irons: bag?.irons ?? undefined,
    wedges: bag?.wedges ?? undefined,
    putter: bag?.putter ?? undefined,
    ball: bag?.ball ?? undefined,
    bag: bag?.bag ?? undefined,
    notes: bag?.notes ?? undefined,
  };

  const data: MegUtstyrsbagData = { utstyr };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <MegUtstyrsbagV2 data={data} />
    </V2Shell>
  );
}
