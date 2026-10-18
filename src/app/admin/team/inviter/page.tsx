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
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AdminInviterCoachTrainLock } from "@/components/admin/v2/oppsett/AdminInviterCoachTrainLock";

export default async function V2AdminInviterCoachPage() {
  const user = await requireCapability(Capability.INVITE_USERS);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/oppsett?fane=team", tekst: "Oppsett" }} dato="Oppsett · team og tilgang" tittel="Inviter coach" />
        <AdminInviterCoachTrainLock kanTildeleTilganger={user.role === "ADMIN"} />
      </div>
    </AgencyOSSkall>
  );
}
