/**
 * /portal/analysere — «Min golf» (bølge 1, design-handover v13)
 * Faner: SG-status · Neste fokus · Runder · Baggen · Putting · Progresjon
 * Komponert fra golfdata-familien; data fra load-min-golf (kun visning).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { loadAnalyticsWorkbenchData } from "./actions";
import { MinGolfPage } from "@/components/portal/analytics/MinGolfPage";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  const user = await requirePortalUser();

  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [minGolf, workbench] = await Promise.all([
    loadMinGolf(user.id),
    loadAnalyticsWorkbenchData(user.id),
  ]);

  return (
    <MinGolfPage
      data={minGolf}
      workbench={{ rounds: workbench.rounds, tests: workbench.tests }}
    />
  );
}
