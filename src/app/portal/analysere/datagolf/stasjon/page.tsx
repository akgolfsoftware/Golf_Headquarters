/**
 * PH17DgStasjon — Precision Athletics. Data og handlinger er beholdt.
 * DataGolf stasjonsmodus for 10 slag mot PGA Tour og Kategori C.
 * Kilde: ui_kits/playerhq/screens/PH-17.jsx (26.09.2026).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TrackMan } from "@/components/portal/precision/PH17TrackMan";
import { loadPH17TrackMan } from "@/lib/portal-analyse/load-ph17-trackman";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stasjon · DataGolf · PlayerHQ" };

export default async function DatagolfStasjonPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [data, uleste] = await Promise.all([
    loadPH17TrackMan(user.id, user.name),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TrackMan data={data} initialFane="stasjon" />
    </PlayerHQSkall>
  );
}
