/**
 * v2-forhåndsvisning — PlayerHQ Utfordringer (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en (IkonRail/BunnNav), UtfordringerV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/utfordringer/page.tsx): samme DrillChallenge-query. Brukerens
 * eierskap, plassering og score beregnes her på serveren og sendes ned som props.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { UtfordringerV2, type UtfordringKortData } from "@/components/portal/v2/UtfordringerV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function V2UtfordringerPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Hent utfordringer hvor brukeren enten er eier eller deltaker (samme query
  // som den ekte skjermen).
  const utfordringer = await prisma.drillChallenge.findMany({
    where: {
      OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }],
    },
    include: {
      owner: { select: { id: true, name: true } },
      participants: { select: { id: true, userId: true, score: true, rank: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tilKort = (u: (typeof utfordringer)[number]): UtfordringKortData => {
    const min = u.participants.find((p) => p.userId === user.id);
    return {
      id: u.id,
      name: u.name,
      description: u.description,
      endAt: u.endAt,
      status: u.status,
      erEier: u.ownerId === user.id,
      deltakere: u.participants.length,
      minRank: min?.rank ?? null,
      minScore: min?.score ?? null,
    };
  };

  const data = {
    aktive: utfordringer.filter((u) => u.status === "ACTIVE").map(tilKort),
    tidligere: utfordringer.filter((u) => u.status === "ENDED").map(tilKort),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <UtfordringerV2 data={data} />
    </V2Shell>
  );
}
