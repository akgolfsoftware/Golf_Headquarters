/**
 * /admin/analysere/compliance — Compliance-sporing (stall-analyse plan vs reps).
 * Synlig underside av Innsikt-hub-en. (Lå tidligere feilaktig på /admin/analyse
 * som er en legacy-rute redirected til /admin/analysere — redesign 2026-06-01.)
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ComplianceTracking } from "@/components/admin/compliance/compliance-tracking";
import { loadComplianceData } from "@/lib/admin-compliance/compliance-data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ periode?: string; studentId?: string }>;

function windowDaysFra(periode: string | undefined): { days: number; label: string } {
  switch (periode) {
    case "7d": return { days: 7, label: "Siste 7 dager" };
    case "90d": return { days: 90, label: "Siste 90 dager" };
    case "365d": return { days: 365, label: "Siste 365 dager" };
    default: return { days: 30, label: "Siste 30 dager" };
  }
}

export default async function CompliancePage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const { days, label } = windowDaysFra(params.periode);

  const data = await loadComplianceData({
    windowDays: days,
    periodLabel: label,
    selectedPlayerId: params.studentId,
  });

  return <ComplianceTracking data={data} />;
}
