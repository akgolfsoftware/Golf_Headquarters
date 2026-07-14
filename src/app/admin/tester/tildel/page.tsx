/**
 * AgencyOS — Tester · Tildel (spiller-velger) (`/admin/tester/tildel`), v2.
 * Port av `(legacy)/tester/tildel/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.27).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTildelVelgSpillerV2 } from "@/components/admin/v2/AdminTesterTildelV2";

export const dynamic = "force-dynamic";

export default async function TildelVelgSpillerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, hcp: true },
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTildelVelgSpillerV2
        spillere={spillere.map((s) => ({ id: s.id, name: s.name ?? "Uten navn", hcpTekst: s.hcp != null ? `HCP ${s.hcp}` : "—" }))}
      />
    </V2Shell>
  );
}
