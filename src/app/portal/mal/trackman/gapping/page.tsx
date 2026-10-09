/**
 * PH17Gapping — Precision Athletics. Data og handlinger er beholdt.
 * Gapping-analyse for køller i bagen med carry, spredning og avstandsgap.
 * Kilde: ui_kits/playerhq/screens/PH-17.jsx (26.09.2026).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { kanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TrackMan } from "@/components/portal/precision/PH17TrackMan";
import { loadPH17TrackMan } from "@/lib/portal-analyse/load-ph17-trackman";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gapping · TrackMan · PlayerHQ" };

export default async function GappingPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [data, uleste] = await Promise.all([
    loadPH17TrackMan(user.id, user.name),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TrackMan data={data} initialFane="gap" visDataGolf={kanSeDataGolf(user)} />
    </PlayerHQSkall>
  );
}
