/**
 * /portal/planlegge/workbench — PlayerHQ Workbench (delt planleggings-kjerne).
 *
 * Hybrid-design (fase 1–3, desktop): WorkbenchHybrid — Anders' egen Workbench-
 * fasit portet visuelt. Spiller-versjon. Coach-versjonen ligger i
 * /admin/spillere/[id]/workbench. Ekte data fra loadWorkbenchData
 * (TrainingPlan + TrainingPlanSession + Goal + TournamentEntry).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { WorkbenchHybrid } from "@/components/workbench-hybrid";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

export const dynamic = "force-dynamic";

function utledInitialer(navn: string): string {
  return (
    navn
      .split(" ")
      .map((d) => d[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"
  );
}

export default async function WorkbenchPage() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();

  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  // Ekte data for innlogget spiller. Mangler/tom → fasit-demo i komponenten.
  const data = (await loadWorkbenchData(user.id)) ?? undefined;

  return (
    <WorkbenchHybrid
      role="player"
      data={data}
      playerName={user.name}
      initials={utledInitialer(user.name)}
    />
  );
}
