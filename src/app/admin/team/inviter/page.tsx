/**
 * AgencyOS Inviter coach — AG-23 (Team) i Precision Athletics. Auth-only server
 * component; skjemaet bruker den eksisterende server actionen `inviterCoach`.
 * Gates på INVITE_USERS (ADMIN + trenere med eksplisitt grant); ekstra
 * tilganger i skjemaet vises kun for ADMIN.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { EKSTRA_TILGANGER } from "@/lib/admin/oppsett/ekstra-tilganger";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG23Inviter } from "@/components/admin/precision/AG23Team";

export const metadata = { title: "Inviter coach · AgencyOS" };

export default async function V2AdminInviterCoachPage() {
  const user = await requireCapability(Capability.INVITE_USERS);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG23Inviter tilstand="data" kanTildeleTilganger={user.role === "ADMIN"} tilganger={EKSTRA_TILGANGER} />
    </AgencyOSSkall>
  );
}
