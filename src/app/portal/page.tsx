/**
 * PlayerHQ Hjem (/portal) — hybrid-design 2026-06-17.
 *
 * Server component: henter all data, sender til HybridHomePage (client).
 * Auth-guard via requirePortalUser. PortalShell (layout) eier topbar/sidebar/
 * bottom-nav — denne siden rendrer kun innholdet i <main>.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { HybridHomePage } from "@/components/portal/dashboard/HybridHomePage";

export const dynamic = "force-dynamic";

export default async function PortalHjemPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getDashboardData(user.id);

  return <HybridHomePage data={data} />;
}
