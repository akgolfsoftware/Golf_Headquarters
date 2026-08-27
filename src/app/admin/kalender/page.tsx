/**
 * AgencyOS Kalender — T7: én Train-lock-flate for uke / måned / dag.
 *
 * C3-laget (`hentKalenderLagUke`) er kjernen. Booking er et lag; lista på
 * `/admin/bookinger` og tavla på `/admin/agencyos/uka` redirecter hit.
 * Google-synk røres ikke.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { KalenderLagUkeV2 } from "@/components/admin/v2/kalender/KalenderLagUkeV2";
import { erKalenderLag, type KalenderLag } from "@/lib/domain/kalender-lag";
import { hentKalenderLagManed, hentKalenderLagUke, type KalenderVisning } from "./lag/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender · AgencyOS" };

type SearchParams = Promise<{
  uke?: string;
  visning?: string;
  maaned?: string;
  dato?: string;
  lag?: string;
}>;

function parseVisning(v?: string): KalenderVisning {
  if (v === "maned" || v === "dag") return v;
  return "uke";
}

export default async function AgencyKalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const visning = parseVisning(sp.visning);
  const startLag: KalenderLag | undefined = sp.lag && erKalenderLag(sp.lag) ? sp.lag : undefined;

  const data =
    visning === "maned"
      ? await hentKalenderLagManed(sp.maaned, { lag: startLag })
      : await hentKalenderLagUke(sp.uke, { lag: startLag, visning, dato: sp.dato });

  return (
    <V2Shell bredde="full" aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <KalenderLagUkeV2 data={data} startLag={startLag} />
    </V2Shell>
  );
}
