/**
 * PlayerHQ Hjem (/portal) — "Spotify Now Playing for trening".
 *
 * Mobil-først workbench: foto-hero, "Dagens økt"-featured, SG-KPI-strip,
 * pyramide-vekting, neste tee og AI-innsikt fra Caddie. Tomstate når data
 * mangler. All data hentes via getHjemData (ekte Prisma).
 *
 * Server component. Auth-guard via requirePortalUser. PortalShell (layout)
 * eier sidebar/topbar/bunn-nav — denne siden rendrer kun innholdet.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getHjemData } from "@/lib/portal-hjem/hjem-data";
import { HjemOversikt } from "@/components/portal/hjem/hjem-oversikt";

export const dynamic = "force-dynamic";

export default async function PortalHjemPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getHjemData(user.id);

  return <HjemOversikt data={data} />;
}
