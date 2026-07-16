/**
 * v2-preview: AgencyOS Inviter coach. Rekomponerer det gamle
 * (legacy)/team/inviter-skjemaet i v2-språket. Auth-only server component —
 * ingen datahenting (skjemaet poster direkte til den eksisterende server
 * actionen `inviterCoach`, gjenbrukt som-den-er fra legacy-treet).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminInviterCoachV2 } from "@/components/admin/v2/AdminInviterCoachV2";

export default async function V2AdminInviterCoachPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/team">Team</TilbakeLenke>
      <AdminInviterCoachV2 />
    </V2Shell>
  );
}
