/**
 * v2-forhåndsvisning — PlayerHQ Meg (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), MegV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/meg-siden: hentProfil for profil,
 * getGoals for sesongmål, Round-aggregat for «Sesongen i tall» (brutto score).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { getGoals } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegV2, type MegData } from "@/components/portal/v2/MegV2";

export const dynamic = "force-dynamic";

export default async function V2MegPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [profil, goals, agg] = await Promise.all([
    hentProfil(),
    getGoals(user.id, 3),
    prisma.round.aggregate({
      where: { userId: user.id },
      _count: { _all: true },
      _min: { score: true },
      _avg: { score: true, sgTotal: true },
    }),
  ]);

  const data: MegData = {
    navn: profil.user.name,
    avatarUrl: profil.user.avatarUrl,
    hcp: profil.user.hcp,
    homeClub: profil.user.homeClub,
    tier: user.tier,
    goals,
    sesong: {
      runder: agg._count._all,
      besteRunde: agg._min.score,
      snittScore: agg._avg.score,
      sgSnitt: agg._avg.sgTotal,
    },
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={data.navn} avatarUrl={data.avatarUrl}>
      <MegV2 data={data} />
    </V2Shell>
  );
}
