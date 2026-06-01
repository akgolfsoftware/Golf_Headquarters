/**
 * /portal/planlegge/workbench — PlayerHQ Workbench (mobil-først 430px).
 *
 * Delt kjerne: spiller-versjon. Coach-versjonen ligger i
 * /admin/spillere/[id]/workbench. Spilleren ser SIN egen plan — ekte data fra
 * loadPlayerWorkbench (TrainingPlan + TrainingPlanSession + Goal).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { PlayerWorkbench } from "@/components/portal/workbench/player-workbench";
import { loadPlayerWorkbench } from "@/lib/portal-workbench/player-workbench-data";

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();

  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await loadPlayerWorkbench();

  return <PlayerWorkbench data={data} />;
}
