/**
 * AgencyOS — Ny drill (`/admin/drills/ny`), v2.
 *
 * Port av `(legacy)/drills/ny/page.tsx` (2026-07-14, AgencyOS Bølge 1.2).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminDrillNyV2 } from "@/components/admin/v2/AdminDrillNyV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny drill · AgencyOS (v2)" };

export default async function NyDrillPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const andreDrills = await prisma.exerciseDefinition.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <V2Shell aktiv="drills" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminDrillNyV2 andreDrills={andreDrills} />
    </V2Shell>
  );
}
