/**
 * PH20Gameplan — banebiblioteket i PlayerHQSkall.
 * Samme baner. En gjest og en foresatt slipper ikke inn.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getBaneLibrary } from "@/lib/gameplan/queries";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { GameplanV2 } from "@/components/portal/v2/GameplanV2";

export const dynamic = "force-dynamic";

export default async function V2GameplanPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [data, ulest] = await Promise.all([
    getBaneLibrary(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/analysere" className="ph-tilbake">Analyse</Link>
        <GameplanV2 data={data} />
      </div>
    </PlayerHQSkall>
  );
}
