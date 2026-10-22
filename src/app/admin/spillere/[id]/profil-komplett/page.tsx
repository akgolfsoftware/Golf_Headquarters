/**
 * AgencyOS — komplett spillerprofil (/admin/spillere/[id]/profil-komplett).
 * Identitet, offisielle resultater, tester og IUP på ett sted. Samme data som WANG og Team Norway
 * ser: ingen kopi. Tilgang: egen coach eller admin (medSpillerTilgang). Golf-ID vises for trenere.
 */

import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesKomplettProfil } from "@/lib/profil-kobling/komplett";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { KomplettProfilAgencyOS } from "@/components/profil/KomplettProfilAgencyOS";
import { byggProfilVisning } from "@/lib/profil-kobling/visning";
import "@/styles/precision-a8.css";

export const dynamic = "force-dynamic";

export default async function KomplettProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;
  const profil = await lesKomplettProfil(user, id);
  if (!profil) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="a8-side">
        <SideHode
          kicker="Stall · Spiller 360 · Komplett profil"
          title={profil.navn}
          sub="Offisielle resultater, tester og IUP. Samme data som Team Norway og WANG ser."
          actions={<KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={`/admin/spillere/${id}`}>Spiller 360</KnappLenke>}
        />
        <KomplettProfilAgencyOS v={byggProfilVisning(profil)} />
      </div>
    </AgencyOSSkall>
  );
}
