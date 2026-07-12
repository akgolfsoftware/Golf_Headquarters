/**
 * v2-preview: AgencyOS Talent-discovery (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/talent/discovery-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-spørring (PLAYER-brukere
 * uten TalentTracking). Filtrering (søk/HCP/klubb) flyttes til klienten for
 * umiddelbar respons — datakontrakten er uendret: alle kandidatene sendes ned.
 * Ingen fabrikerte tall (potensial = kun ekte HCP + spilte år).
 *
 * Server component.
 */

import { coachedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTalentDiscoveryV2,
  type TalentDiscoveryV2Data,
} from "@/components/admin/v2/AdminTalentDiscoveryV2";

export const dynamic = "force-dynamic";

export default async function V2AdminTalentDiscoveryPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const alle = await prisma.user.findMany({
    where: {
      ...coachedPlayerWhere(),
      talentTracking: { is: null },
    },
    select: {
      id: true,
      name: true,
      hcp: true,
      playingYears: true,
      homeClub: true,
    },
    orderBy: [{ hcp: "asc" }, { name: "asc" }],
  });

  const klubber = Array.from(
    new Set(alle.map((u) => u.homeClub).filter((k): k is string => Boolean(k))),
  ).sort();

  const data: TalentDiscoveryV2Data = {
    total: alle.length,
    kandidater: alle.map((u) => ({
      id: u.id,
      navn: u.name ?? "Uten navn",
      hcp: u.hcp,
      playingYears: u.playingYears,
      homeClub: u.homeClub,
    })),
    klubber,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTalentDiscoveryV2 data={data} />
    </V2Shell>
  );
}
