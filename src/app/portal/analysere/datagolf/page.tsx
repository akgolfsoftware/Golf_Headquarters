/**
 * PH16DataGolf — DataGolf-spillerkort i PlayerHQSkall.
 * Kun DataGolf-motor. Broadie og PEI blandes aldri inn.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getUnreadNotifications } from "@/app/portal/actions";
import { DataGolfV2 } from "@/components/portal/v2/DataGolfV2";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUtfordringer } from "@/lib/datagolf/challenge-data";
import { hentSpillerverktoy } from "@/lib/datagolf/player-tool-data";

export const dynamic = "force-dynamic";

export default async function AnalysereDataGolfPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const sp = await searchParams;
  const [data, historikk, ulest] = await Promise.all([
    hentSpillerverktoy(user.id, sp),
    hentUtfordringer(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/analysere" className="ph-tilbake">Analyse</Link>
          <Link
            href={`/portal/analysere/datagolf/stasjon${data.proff ? `?tak=${data.proff.dgId}` : ""}`}
            className="pa-btn pa-btn--primary"
          >
            Prøv selv
          </Link>
          <DataGolfV2 data={data} historikk={historikk} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
