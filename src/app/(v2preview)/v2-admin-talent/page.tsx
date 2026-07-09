/**
 * v2-preview: AgencyOS Talent-hub (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell
 * leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/talent-flaten: samme requirePortalUser-guard
 * (ADMIN/COACH) og samme TalentTracking-spørring. Mapper radene → AdminTalentData
 * (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTalentV2,
  type AdminTalentData,
  type AdminTalentSpiller,
} from "@/components/admin/v2/AdminTalentV2";

export const dynamic = "force-dynamic";

type TalentRow = {
  userId: string;
  niva: string;
  klubb: string | null;
  region: string | null;
  fysisk: number | null;
  teknikk: number | null;
  taktikk: number | null;
  mental: number | null;
  motivasjon: number | null;
  user: { id: string; name: string; hcp: number | null };
};

export default async function V2AdminTalentPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const rows = (await prisma.talentTracking.findMany({
    include: { user: { select: { id: true, name: true, hcp: true } } },
    orderBy: { updatedAt: "desc" },
  })) as TalentRow[];

  const spillere: AdminTalentSpiller[] = rows.map((r) => ({
    id: r.userId,
    navn: r.user.name,
    hcp: r.user.hcp,
    niva: r.niva,
    klubb: r.klubb,
    region: r.region,
    verdier: {
      fysisk: r.fysisk,
      teknikk: r.teknikk,
      taktikk: r.taktikk,
      mental: r.mental,
      motivasjon: r.motivasjon,
    },
  }));

  const data: AdminTalentData = { spillere };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTalentV2 data={data} />
    </V2Shell>
  );
}
