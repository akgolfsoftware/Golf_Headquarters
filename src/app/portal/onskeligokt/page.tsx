/**
 * v2-forhåndsvisning — PlayerHQ Be om økt (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), OnskeligOktV2 rendrer skjema-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/onskeligokt/page.tsx): coach-lista utledes av hvem som faktisk
 * tilbyr coaching (serviceType.coachUserId), ikke role=COACH.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { OnskeligOktV2 } from "@/components/portal/v2/OnskeligOktV2";

export const dynamic = "force-dynamic";

export default async function V2OnskeligOktPreviewPage() {
  const user = await requirePortalUser();

  const coachLinks = await prisma.serviceType.findMany({
    where: { coachUserId: { not: null } },
    select: { coachUserId: true },
    distinct: ["coachUserId"],
  });
  const coachIds = coachLinks
    .map((s) => s.coachUserId)
    .filter((id): id is string => id !== null);
  const coacher = await prisma.user.findMany({
    where: { id: { in: coachIds }, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const coachName = coacher[0]?.name ?? "coachen";

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <OnskeligOktV2 data={{ coacher, coachName }} />
    </V2Shell>
  );
}
