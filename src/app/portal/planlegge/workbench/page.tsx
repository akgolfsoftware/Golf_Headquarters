/**
 * /portal/planlegge/workbench — Workbench Plan A.
 *
 * Sprint 6: server-loaded sessions + facilities. Sessions seedes
 * automatisk fra mock-data hvis bruker ikke har noen ennå.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { WorkbenchPlanA } from "@/components/portal-planlegge/workbench/workbench-shell";
import type {
  Axis,
  WBP_Session,
} from "@/components/portal-planlegge/workbench/types";
import { listPlanSessions, loadFacilities } from "./actions";

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const user = await requirePortalUser();
  const viewMode = await getViewMode();

  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [planSessions, facilities] = await Promise.all([
    listPlanSessions().catch(() => []),
    loadFacilities().catch(() => undefined),
  ]);

  const sessions: WBP_Session[] = planSessions.map((s) => ({
    id: s.id,
    week: s.week,
    day: s.day,
    span: s.span,
    axis: s.axis as Axis,
    title: s.title,
    meta: s.meta,
    done: s.done,
    now: s.isNow,
    peak: s.isPeak,
  }));

  return (
    <WorkbenchPlanA
      initialSessions={sessions.length > 0 ? sessions : undefined}
      initialFacilities={facilities}
    />
  );
}
