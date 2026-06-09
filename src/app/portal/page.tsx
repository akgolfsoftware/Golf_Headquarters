/**
 * PlayerHQ Hjem (/portal) — v10-design.
 *
 * Rendrer <PlayerHome> (v10-fasit fra pl-hjem) med EKTE data fra getHjemData
 * (Prisma). Foto-hero, "Dagens økt"-featured, SG-KPI-strip, pyramide-vekting,
 * neste tee og Caddie-innsikt. Tom-tilstand når data mangler — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. PortalShell (layout) eier
 * sidebar/topbar/bunn-nav — denne siden rendrer kun innholdet.
 *
 * Bolk 1 (3. juni): byttet fra HjemOversikt (gammelt design) til PlayerHome (v10).
 * mapHjemData oversetter den eksisterende HjemData-shapen til PlayerHomeData.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getHjemData } from "@/lib/portal-hjem/hjem-data";
import { PlayerHome } from "@/components/portal/home/player-home";

export const dynamic = "force-dynamic";

export default async function PortalHjemPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getHjemData(user.id);

  return <PlayerHome data={data} />;
}
