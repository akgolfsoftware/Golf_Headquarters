/**
 * /portal/planlegge/workbench — PlayerHQ Workbench (mobil-først 430px).
 *
 * Delt kjerne: spiller-versjon. Coach-versjonen ligger i
 * /admin/spillere/[id]/workbench. Spilleren ser SIN egen plan — ekte data fra
 * loadWorkbenchData (TrainingPlan + TrainingPlanSession + Goal + TournamentEntry).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { Workbench } from "@/components/workbench/workbench";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();

  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  // W5b: ekte data for innlogget spiller. Mangler/tom → v10-demo i komponenten.
  const data = (await loadWorkbenchData(user.id)) ?? undefined;

  return <Workbench role="player" data={data} />;
}
