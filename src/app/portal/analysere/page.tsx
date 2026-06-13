/**
 * /portal/analysere — PlayerHQ Analytics Workbench.
 * Visuelt lik Planlegg-Workbench med egen analytics-sidebar og innhold.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { loadAnalyticsWorkbenchData } from "./actions";
import { AnalyticsWorkbenchShell } from "@/components/portal/analytics/AnalyticsWorkbenchShell";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();

  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await loadAnalyticsWorkbenchData(user.id);

  return <AnalyticsWorkbenchShell data={data} />;
}
