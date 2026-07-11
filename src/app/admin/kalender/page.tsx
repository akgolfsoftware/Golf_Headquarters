/**
 * v2-forhåndsvisning — AgencyOS Kalender (coach). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth er identisk med /admin/kalender: requirePortalUser (ADMIN/COACH).
 * Data hentes av hentAgencyKalenderData (Booking + gjentakende GroupSchedule).
 * ?uke=YYYY-MM-DD navigerer mellom uker.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AgencyKalenderV2 } from "@/components/admin/v2/AgencyKalenderV2";
import { hentAgencyKalenderData } from "./data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

export default async function V2AgencyKalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { uke } = await searchParams;
  const data = await hentAgencyKalenderData(uke);

  return (
    <V2Shell aktiv="uka" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AgencyKalenderV2 data={data} />
    </V2Shell>
  );
}
