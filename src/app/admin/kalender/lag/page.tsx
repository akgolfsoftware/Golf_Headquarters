/**
 * AgencyOS Kalender-lag (Loop 7/C3, natt-plan bølge 2) — `/admin/kalender/lag`.
 *
 * Ny, egen flate ved siden av `/admin/kalender` (booking-uka). Viser fem lag
 * på tvers av domenet (økter/skole/turnering/tester/booking) og KA-05
 * rom-/sim-kollisjonsvarsel. Ingen Google — se `data.ts` filhode.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { KalenderHubNav } from "@/components/admin/v2/agency-hub-subnav";
import { KalenderLagUkeV2 } from "@/components/admin/v2/kalender/KalenderLagUkeV2";
import { hentKalenderLagUke } from "./data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender · Lag · AgencyOS" };

type SearchParams = Promise<{ uke?: string }>;

export default async function KalenderLagPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { uke } = await searchParams;
  const data = await hentKalenderLagUke(uke);

  return (
    <V2Shell bredde="full" aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <KalenderHubNav />
      <KalenderLagUkeV2 data={data} />
    </V2Shell>
  );
}
