/**
 * v2-preview: AgencyOS Compliance (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell
 * leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/analysere/compliance-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH), samme loadComplianceData-loader og
 * samme ?periode / ?studentId-kontrakt. AdminComplianceV2 rendrer ComplianceData
 * direkte — ingen mapping, ingen fabrikerte tall.
 *
 * Server component.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadComplianceData } from "@/lib/admin-compliance/compliance-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminComplianceV2 } from "@/components/admin/v2/AdminComplianceV2";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ periode?: string; studentId?: string }>;

function windowDaysFra(periode: string | undefined): { days: number; label: string } {
  switch (periode) {
    case "7d":
      return { days: 7, label: "Siste 7 dager" };
    case "90d":
      return { days: 90, label: "Siste 90 dager" };
    case "365d":
      return { days: 365, label: "Siste 365 dager" };
    default:
      return { days: 30, label: "Siste 30 dager" };
  }
}

export default async function V2AdminCompliancePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const params = await searchParams;
  const { days, label } = windowDaysFra(params.periode);

  const data = await loadComplianceData({
    windowDays: days,
    periodLabel: label,
    selectedPlayerId: params.studentId,
  });

  return (
    <V2Shell aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/analysere">Innsikt</TilbakeLenke>
      <AdminComplianceV2 data={data} />
    </V2Shell>
  );
}
