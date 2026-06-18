/**
 * /portal/analysere — PlayerHQ Analyse (hybrid-design 2026-06-17)
 * Faner: Strokes Gained · Runder · TrackMan · Tester
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { loadAnalyticsWorkbenchData } from "./actions";
import { HybridAnalysePage } from "@/components/portal/analytics/HybridAnalysePage";

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

  return <HybridAnalysePage data={data} />;
}
