/**
 * v2-forhåndsvisning — PlayerHQ Coach-videoer (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav), CoachVideoerV2 innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/coach/videoer-siden 1:1:
 * requirePortalUser (PLAYER/COACH/ADMIN) + prisma.sessionVideo (status READY,
 * spillerens egne, nyeste først).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachVideoerV2, type CoachVideoerData } from "@/components/portal/v2/CoachVideoerV2";

export const dynamic = "force-dynamic";

export default async function V2CoachVideoerPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const videos = await prisma.sessionVideo.findMany({
    where: { playerId: user.id, status: "READY" },
    include: { coach: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data: CoachVideoerData = {
    videoer: videos.map((v) => ({
      id: v.id,
      title: v.title,
      tag: v.tag,
      thumbnailUrl: v.thumbnailUrl,
      durationSec: v.durationSec,
      createdAt: v.createdAt,
      coachName: v.coach.name,
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <CoachVideoerV2 data={data} />
    </V2Shell>
  );
}
