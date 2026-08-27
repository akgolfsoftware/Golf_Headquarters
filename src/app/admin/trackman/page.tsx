/**
 * TM-06 Agency TrackMan (på tvers) — T9 Train-lock, 27.08.2026.
 * Erstatter forrige Paper-tokens-port (`T.*`/`AdminTrackmanV2`) — samme
 * rute, samme auth, ny datakontrakt som gjenbruker TM-11s dispersion-
 * regning (src/lib/trackman/agency-stall-data.ts) slik at tallene stemmer
 * overens med spillerens egen øktdetalj.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { InnsiktHubNav } from "@/components/admin/v2/agency-hub-subnav";
import { lastAgencyTrackmanData } from "@/lib/trackman/agency-stall-data";
import { AdminTrackmanTrainLock } from "@/components/admin/v2/trackman/AdminTrackmanTrainLock";

export const dynamic = "force-dynamic";

export default async function V2AdminTrackmanPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await lastAgencyTrackmanData();

  return (
    <V2Shell bredde="kolonne" aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <InnsiktHubNav />
      <AdminTrackmanTrainLock data={data} />
    </V2Shell>
  );
}
