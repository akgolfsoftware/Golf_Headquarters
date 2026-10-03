/**
 * PH21BeOmOkt — be om økt i PlayerHQSkall.
 * Coach-listen er fortsatt de som faktisk tilbyr coaching. Sendingen er den samme.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { OnskeligOktV2 } from "@/components/portal/v2/OnskeligOktV2";

export const dynamic = "force-dynamic";

export default async function V2OnskeligOktPreviewPage() {
  const user = await requirePortalUser();
  const [coachLinks, ulest] = await Promise.all([
    prisma.serviceType.findMany({
      where: { coachUserId: { not: null } },
      select: { coachUserId: true },
      distinct: ["coachUserId"],
    }),
    getUnreadNotifications(user.id, 1),
  ]);
  const coachIds = coachLinks.map((s) => s.coachUserId).filter((id): id is string => id !== null);
  const coacher = await prisma.user.findMany({
    where: { id: { in: coachIds }, deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/gjennomfore" className="ph-tilbake">Gjør</Link>
        <OnskeligOktV2 data={{ coacher, coachName: coacher[0]?.name ?? "coachen" }} />
      </div>
    </PlayerHQSkall>
  );
}
