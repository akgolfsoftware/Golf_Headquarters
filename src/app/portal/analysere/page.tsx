/**
 * /portal/analysere — «Analysere», PlayerHQ samlet analyseflate.
 * Faner (Anders 2026-07-08): SG · Statistikk · Treningsanalyse · TrackMan · Tester
 * Komponert fra golfdata-familien; data fra load-min-golf + treningsanalyse (kun visning).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { hentTreningsanalyse } from "@/lib/portal-analyse/treningsanalyse-data";
import { loadAnalyticsWorkbenchData } from "./actions";
import { MinGolfPage } from "@/components/portal/analytics/MinGolfPage";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  const user = await requirePortalUser();

  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [minGolf, workbench, trening] = await Promise.all([
    loadMinGolf(user.id),
    loadAnalyticsWorkbenchData(user.id),
    hentTreningsanalyse(user.id),
  ]);

  return (
    <MinGolfPage
      data={minGolf}
      workbench={{ rounds: workbench.rounds, tests: workbench.tests }}
      trening={trening}
    />
  );
}
