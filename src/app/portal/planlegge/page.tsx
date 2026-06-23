/**
 * /portal/planlegge — PlayerHQ Planlegge (lys mobil-fasit, terminal-lys).
 *
 * Spillerens ukeplan som LYS vertikal dag-liste (PlayerHQ-regel: alltid lyst).
 * Den mørke delte Workbench-en brukes kun på coach-flatene (AgencyOS), aldri
 * her. Detaljert workbench bor på /portal/planlegge/workbench.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { PlayerPlanMobile } from "@/components/portal/plan/PlayerPlanMobile";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

export const dynamic = "force-dynamic";

export default async function PlanleggePage() {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = (await loadWorkbenchData(user.id)) ?? undefined;

  return <PlayerPlanMobile data={data} />;
}
