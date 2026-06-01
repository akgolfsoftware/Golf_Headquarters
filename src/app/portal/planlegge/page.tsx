/**
 * /portal/planlegge — PlayerHQ Planlegge hub (landingsside)
 *
 * Viser PlanleggeOverview: oversiktskort (Årsplan, Treningsplan, Fysplan,
 * Mål, Turneringer, Drills) med ekte status, hver lenket til sin dedikerte side.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { PlanleggeOverview } from "@/components/portal-planlegge/planlegge-overview";

export const dynamic = "force-dynamic";

export default async function PlanleggePage() {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  return <PlanleggeOverview userId={user.id} />;
}
