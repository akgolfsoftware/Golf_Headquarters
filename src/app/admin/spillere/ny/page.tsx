/**
 * AgencyOS Ny spiller i nytt design (AG07SpillerNy, 19.10.2026).
 *
 * Auth som før: requirePortalUser (ADMIN/COACH). Skjemaet har ingen
 * data-loader; submit bruker den ekte server-handlingen `createSpiller` og
 * åpner den nye spillerens profil.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AG07SpillerNy } from "@/components/admin/precision/AG07SpillerNy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny spiller · AgencyOS" };

export default async function SpillerNyPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/spillere", tekst: "Stall" }} dato="Stall · ny spiller" tittel="Ny spiller"
          ingress="Fire steg. Spilleren får invitasjon på e-post hvis du sender den nå." />
        <AG07SpillerNy />
      </div>
    </AgencyOSSkall>
  );
}
