/**
 * /portal/planlegge — PlayerHQ Planlegge = Workbench.
 * Ett trykkpunkt inn i den delte Workbench-kjernen (WorkbenchHybrid), som er
 * responsiv: mode-rail + sheets på mobil, full panel-flate på desktop.
 * Samme flate som /portal/planlegge/workbench.
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

export default async function PlanleggePage() {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

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
