/**
 * AgencyOS Inviter coach — AG-23 (Team) i Precision Athletics. Auth-only server
 * component; skjemaet bruker den eksisterende server actionen `inviterCoach`.
 * Gates på INVITE_USERS (ADMIN + trenere med eksplisitt grant); ekstra
 * tilganger i skjemaet vises kun for ADMIN.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability, CAPABILITY_BESKRIVELSER } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG23Inviter } from "@/components/admin/precision/AG23Team";

// G6: ekstra-tilganger utover COACH-defaulten som ADMIN kan gi ved invitasjon.
const EKSTRA_TILGANGER = [
  Capability.VIEW_FINANCE,
  Capability.MANAGE_FACILITIES,
  Capability.MANAGE_USERS,
  Capability.USE_AGENTS,
  Capability.INVITE_USERS,
].map((id) => ({ id, label: CAPABILITY_BESKRIVELSER[id] }));

export const metadata = { title: "Inviter coach · AgencyOS" };

export default async function V2AdminInviterCoachPage() {
  const user = await requireCapability(Capability.INVITE_USERS);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG23Inviter tilstand="data" kanTildeleTilganger={user.role === "ADMIN"} tilganger={EKSTRA_TILGANGER} />
    </AgencyOSSkall>
  );
}
