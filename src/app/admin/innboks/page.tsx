/**
 * v2-preview: AgencyOS Triage / Innboks (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data er identisk med cockpit-ruten: samme requirePortalUser-guard
 * (ADMIN/COACH) og samme loadDailyBrief-loader (køen gjenbrukes, grupperes).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { loadAppFeedback } from "@/lib/admin/load-app-feedback";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TriageV2 } from "@/components/admin/v2/TriageV2";

export const dynamic = "force-dynamic";

export default async function V2TriagePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const [data, feedback] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name }),
    loadAppFeedback(),
  ]);
  return (
    <V2Shell aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TriageV2 data={data} feedback={feedback} />
    </V2Shell>
  );
}
