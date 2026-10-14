/**
 * PH17DgStasjon — Precision Athletics. Data og handlinger er beholdt.
 * DataGolf stasjonsmodus for 10 slag mot PGA Tour og Kategori C.
 * Kilde: ui_kits/playerhq/screens/PH-17.jsx (26.09.2026).
 */

import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TrackMan } from "@/components/portal/precision/PH17TrackMan";
import { loadPH17TrackMan } from "@/lib/portal-analyse/load-ph17-trackman";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stasjon · DataGolf · PlayerHQ" };

export default async function DatagolfStasjonPage() {
  // Data Golf er bare for coach og admin (Anders 09.10.2026).
  const user = await krevDataGolfBruker("/portal/analysere/datagolf/stasjon");

  const [data, uleste] = await Promise.all([
    loadPH17TrackMan(user.id, user.name),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TrackMan data={data} initialFane="stasjon" visDataGolf />
    </PlayerHQSkall>
  );
}
