/**
 * AgencyOS — Tjenester (`/admin/services`), v2.
 *
 * Port av `(legacy)/services/page.tsx` (2026-07-14, AgencyOS Bølge 2.1) —
 * samme datamodell (`prisma.serviceType`), ny v2-presentasjon i
 * `AdminTjenesterV2`. `(legacy)/services/actions.ts` bor fortsatt der — delt
 * server actions (createService/updateService/deleteService), uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTjenesterV2 } from "@/components/admin/v2/AdminTjenesterV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tjenester · AgencyOS (v2)" };

export default async function ServicesPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tjenester = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: { id: true, name: true, description: true, durationMin: true, priceOre: true, active: true },
  });

  return (
    <V2Shell aktiv="services" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTjenesterV2 tjenester={tjenester} />
    </V2Shell>
  );
}
