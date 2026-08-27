/**
 * v2-preview: AgencyOS Inviter coach. Rekomponerer det gamle
 * (legacy)/team/inviter-skjemaet i v2-språket. Auth-only server component —
 * ingen datahenting (skjemaet poster direkte til den eksisterende server
 * actionen `inviterCoach`, gjenbrukt som-den-er fra legacy-treet).
 * G6: gates på INVITE_USERS (i praksis ADMIN + trenere med eksplisitt grant);
 * ekstra-tilganger i skjemaet vises kun for ADMIN.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminInviterCoachTrainLock } from "@/components/admin/v2/oppsett/AdminInviterCoachTrainLock";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";

export default async function V2AdminInviterCoachPage() {
  const user = await requireCapability(Capability.INVITE_USERS);

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/team">Team</TlTilbake>
      <AdminInviterCoachTrainLock kanTildeleTilganger={user.role === "ADMIN"} />
    </V2Shell>
  );
}
