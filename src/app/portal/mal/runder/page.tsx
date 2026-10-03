/**
 * PH18Runder — rundelisten i PlayerHQSkall.
 * Samme runder, status og veier til live, etterregistrering og detaljer.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getRunderListModel } from "@/lib/portal-runder/runder-list-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { RunderV2 } from "@/components/portal/v2/RunderV2";

export const dynamic = "force-dynamic";

export default async function V2RunderPreviewPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [model, ulest] = await Promise.all([
    getRunderListModel(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/analysere" className="ph-tilbake">Analyse</Link>
        <RunderV2 data={{ navn: user.name ?? "", hcp: user.hcp, rows: model.rows, kpis: model.kpis }} />
      </div>
    </PlayerHQSkall>
  );
}
