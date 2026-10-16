/**
 * PH26Fysisk — fysisk logging i PlayerHQSkall.
 * Sett, intervaller og pulssone bruker fortsatt de eksisterende loggekomponentene.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getFysiskData } from "@/lib/portal-fysisk/fysisk-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FysiskV2 } from "@/components/portal/v2/FysiskV2";

export const dynamic = "force-dynamic";

export default async function V2FysiskPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [data, ulest] = await Promise.all([
    getFysiskData(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/gjennomfore" className="ph-tilbake">Gjør</Link>
        <FysiskV2 data={data} />
      </div>
    </PlayerHQSkall>
  );
}
