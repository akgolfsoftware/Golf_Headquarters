/**
 * PlayerHQ Planlegge — Paper 1:1 (designport PR-B).
 * Fasit: designsystem/paper/fase1/playerhq-plan.html
 *
 * PaperShell + PaperPlan — IKKE V2Shell (gammelt designsystem).
 * Samme chrome-mønster som Hjem (rail/tabs + Paper-tokens).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { PaperPlan } from "@/components/portal/paper/PaperPlan";

export const dynamic = "force-dynamic";

export default async function PlanleggePage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getDashboardData(user.id);
  return <PaperPlan data={data} />;
}
