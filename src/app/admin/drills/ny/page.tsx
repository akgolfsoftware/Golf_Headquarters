/**
 * AgencyOS — Ny drill v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/drills/ny (`DrillCreateForm`) — samme redusert
 * felt-sett og samme server action `createDrill` (uendret i
 * (legacy)/drills/actions.ts).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminDrillOpprettV2 } from "@/components/admin/v2/AdminDrillOpprettV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny drill · AgencyOS" };

export default async function AdminDrillNyPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/drills">Drill-bibliotek</TilbakeLenke>
      <AdminDrillOpprettV2 />
    </V2Shell>
  );
}
