/**
 * /portal/planlegge/workbench — PlayerHQ Workbench (delt planleggings-kjerne).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { WorkbenchHybrid } from "@/components/workbench-hybrid";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";

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

  const ctx = await loadWorkbenchContext(user.id);
  const data = ctx?.data;

  return (
    <WorkbenchHybrid
      role="player"
      data={data}
      insightsLine={ctx?.insights.line ?? null}
      playerName={user.name}
      initials={utledInitialer(user.name)}
    />
  );
}