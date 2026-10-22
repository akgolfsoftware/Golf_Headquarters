/**
 * AgencyOS · AK-stigen — junior-stige (Mini → Elite) i nytt design
 * (AG16AkStigen, 19.10.2026). Nås fra AK-stigen-kortet i Grupper.
 * Skrå-drakten 22.10 (bølge 2, pakke A5, skissen §5 «Liste»): lav topp med bilde og hvite kort.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AG16AkStigen } from "@/components/admin/precision/AG16AkStigen";
import { lastAkStigenData } from "@/lib/agencyos/ak-stigen-data";
import "@/styles/agencyos-ny-a5-skra.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "AK-stigen · AgencyOS" };

export default async function AkStigenPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await lastAkStigenData();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s agn-a5-under">
        <Topp tilbake={{ href: "/admin/grupper", tekst: "Grupper" }} dato="Grupper · junior" tittel="AK-stigen" bilde="/images/playerhq/slag-putting.jpg"
          ingress="Mini, Basis, Utvikling og Elite, med gruppene som står ved siden av stigen." />
        <AG16AkStigen data={data} />
      </div>
    </AgencyOSSkall>
  );
}
