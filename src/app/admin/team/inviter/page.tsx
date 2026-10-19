/**
 * AgencyOS Inviter coach i nytt design (AG23InviterCoach, 19.10.2026). Auth-only server component —
 * ingen datahenting (skjemaet poster direkte til den eksisterende server
 * actionen `inviterCoach`, gjenbrukt som-den-er fra legacy-treet).
 * G6: gates på INVITE_USERS (i praksis ADMIN + trenere med eksplisitt grant);
 * ekstra-tilganger i skjemaet vises kun for ADMIN.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AG23InviterCoach } from "@/components/admin/precision/AG23InviterCoach";

export default async function V2AdminInviterCoachPage() {
  const user = await requireCapability(Capability.INVITE_USERS);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/oppsett?fane=team", tekst: "Oppsett" }} dato="Oppsett · team og tilgang" tittel="Inviter coach" />
        <AG23InviterCoach kanTildeleTilganger={user.role === "ADMIN"} />
      </div>
    </AgencyOSSkall>
  );
}
