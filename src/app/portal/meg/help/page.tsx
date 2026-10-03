/**
 * PH25Hjelp — hjelpesenter i PlayerHQSkall.
 * Samme spørsmål, kategorier og artikler. En foresatt sendes bort.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { MegHelpV2, type MegHelpData } from "@/components/portal/v2/MegHelpV2";
import { HJELP_FAQ, HJELP_KATEGORIER, HJELP_ARTIKLER } from "./data";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data: MegHelpData = { faq: HJELP_FAQ, kategorier: HJELP_KATEGORIER, artikler: HJELP_ARTIKLER };
  const ulest = await getUnreadNotifications(user.id, 1);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
        <MegHelpV2 data={data} />
      </div>
    </PlayerHQSkall>
  );
}
