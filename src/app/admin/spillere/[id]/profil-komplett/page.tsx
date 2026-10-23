/**
 * AgencyOS — komplett spillerprofil (/admin/spillere/[id]/profil-komplett).
 * Identitet, offisielle resultater, tester og IUP på ett sted. Samme data som WANG og Team Norway
 * ser: ingen kopi. Tilgang: egen coach eller admin (medSpillerTilgang). Golf-ID vises for trenere.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesKomplettProfil } from "@/lib/profil-kobling/komplett";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { KomplettProfilAgencyOS } from "@/components/profil/KomplettProfilAgencyOS";
import { byggProfilVisning } from "@/lib/profil-kobling/visning";
import "@/styles/precision-a8.css";
import "@/styles/agencyos-ny-spiller360.css";

export const dynamic = "force-dynamic";

export default async function KomplettProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;
  const profil = await lesKomplettProfil(user, id);
  if (!profil) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: `/admin/spillere/${id}`, tekst: "Spiller 360" }} dato="Stall · Spiller 360 · Komplett profil" tittel={profil.navn}
          ingress="Offisielle resultater, tester og IUP. Samme data som Team Norway og WANG ser." />
        <div className="a2-under">
          <KomplettProfilAgencyOS v={byggProfilVisning(profil)} />
        </div>
      </div>
    </AgencyOSSkall>
  );
}
