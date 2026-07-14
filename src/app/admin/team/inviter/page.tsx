/**
 * AgencyOS — Inviter coach (`/admin/team/inviter`), v2.
 * Port av `(legacy)/team/inviter/page.tsx` (2026-07-14, AgencyOS Bølge 3.2) —
 * samme `inviterCoach`-kontrakt, ny v2-presentasjon i `AdminInviterCoachV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminInviterCoachV2 } from "@/components/admin/v2/AdminInviterCoachV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inviter coach · AgencyOS (v2)" };

export default async function InviterCoachPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminInviterCoachV2 />
    </V2Shell>
  );
}
