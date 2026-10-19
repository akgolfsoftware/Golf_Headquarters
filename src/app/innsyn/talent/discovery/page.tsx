/**
 * AgencyOS — Talent · Discovery, i Precision Athletics (AgencyOSSkall + TalentDiscovery).
 *
 * Auth og data er uendret: requirePortalUser (ADMIN/COACH) og samme Prisma-spørring
 * (PLAYER-brukere i coachens stall uten TalentTracking). Filtreringen (søk/HCP/klubb)
 * skjer i klienten; alle kandidatene sendes ned. Ingen fabrikerte tall.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { TalentDiscovery, type TalentDiscoveryData } from "@/components/admin/agencyos-ny/TalentDiscovery";

export const dynamic = "force-dynamic";
export const metadata = { title: "Talent-discovery · AgencyOS" };

export default async function TalentDiscoveryPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const alle = await prisma.user.findMany({
    where: {
      ...coachScopedPlayerWhere(user),
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

  const data: TalentDiscoveryData = {
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
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/innsyn/talent/radar", tekst: "Innsikt og talent" }} dato="Talent · discovery" tittel="Discovery"
          ingress="Spillere som ennå ikke er i talent-oppfølgingen. Søk, filtrer på HCP og klubb, og legg de mest aktuelle inn." />
        <TalentDiscovery data={data} />
      </div>
    </AgencyOSSkall>
  );
}
