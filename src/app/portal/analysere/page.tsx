/**
 * PlayerHQ Analyse-hub — PH16Analyse i Precision Athletics.
 * Tilgang og hentAnalyseHub beholdes. Historikk ligger fortsatt på egen rute.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16Analyse } from "@/components/portal/precision/PH16Analyse";
import { hentAnalyseHub } from "@/lib/portal-analyse/tm-hub-data";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analyse · PlayerHQ" };

export default async function AnalyserePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [data, uleste] = await Promise.all([
    hentAnalyseHub(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <div className="pa-side">
        <PH16Analyse data={data} />
      </div>
    </PlayerHQSkall>
  );
}
