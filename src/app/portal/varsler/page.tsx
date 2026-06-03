/**
 * PlayerHQ Varsler (/portal/varsler) — v10-design.
 *
 * Rendrer <Varsler> (v10-fasit fra pl-varsler) med EKTE data fra
 * prisma.notification (per innlogget bruker). mapVarslerData oversetter rad-
 * shapen til komponentens VarslerData (dag-grupper med ikon/tone/eyebrow/tid).
 *
 * Tom-tilstand bevares: ingen rader ⇒ tomme grupper og «0 nye» — aldri
 * liksom-data. Det gamle dummyVarsler()-fallbacket er fjernet i denne porten.
 *
 * Server component. Auth-guard via requirePortalUser. Layout eier sidebar/
 * bunn-nav — denne siden rendrer kun innholdet.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Varsler } from "@/components/portal/varsler/varsler";
import { mapVarslerData } from "./map-varsler-data";

export const dynamic = "force-dynamic";

export default async function VarslerPage() {
  const user = await requirePortalUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return <Varsler data={mapVarslerData(rows)} />;
}
