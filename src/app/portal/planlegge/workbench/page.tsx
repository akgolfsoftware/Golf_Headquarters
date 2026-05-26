/**
 * /portal/planlegge/workbench — Workbench Plan A
 *
 * Implementering av workbench-v2/Workbench Plan A.html.
 * Sprint 1: chrome + canvas (periode-view) + drawer + Facilities-modal.
 * Resterende zoom-views + modaler er stubbet inntil Sprint 2.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { WorkbenchPlanA } from "@/components/portal-planlegge/workbench/workbench-shell";

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();

  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  return <WorkbenchPlanA />;
}
