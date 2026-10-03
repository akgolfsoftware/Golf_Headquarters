/**
 * PH22Turnering — turneringsplan i PlayerHQSkall.
 * Planen din + katalogen · brutto score. Påmelding skjer aldri fra lista.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";

import {
  loadPlanleggerKatalog,
  loadMinTurneringsplan,
} from "@/lib/portal-turnering/planlegger-data";
import { TurneringPlanleggerV2 } from "@/components/portal/v2/TurneringPlanleggerV2";

export const dynamic = "force-dynamic";

export default async function TurneringerPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [katalog, minPlan, ulest] = await Promise.all([
    loadPlanleggerKatalog(user.id),
    loadMinTurneringsplan(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/tren" className="ph-tilbake">Tren</Link>
        <TurneringPlanleggerV2
          katalog={katalog}
          minPlan={minPlan}
          spillerNavn={user.name}
        />
      </div>
    </PlayerHQSkall>
  );
}
