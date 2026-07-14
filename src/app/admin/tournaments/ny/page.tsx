/**
 * AgencyOS — Ny turnering (`/admin/tournaments/ny`), v2. Port av
 * `(legacy)/tournaments/ny/page.tsx` + `wizard.tsx` (2026-07-14, AgencyOS
 * Bølge 3.30) — samme `createTournament`-kontrakt (bor i `(legacy)/
 * tournaments/ny/actions.ts`, delt, uendret).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTurneringerNyV2 } from "@/components/admin/v2/AdminTurneringerNyV2";

export const dynamic = "force-dynamic";

export default async function NyTurneringPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTurneringerNyV2 courses={courses} />
    </V2Shell>
  );
}
