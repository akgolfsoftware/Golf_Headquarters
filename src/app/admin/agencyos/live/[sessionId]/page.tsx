/**
 * AgencyOS · Live-økt (coach). Paper-fasit: fase1/agencyos-live-session.html.
 * «UNDER-flata mens økta pågår» — søsterflate til FangstSheet, men for
 * coachen. Skilt fra /admin/agencyos/live (Mission Control), som er en
 * annen flate (tverrgående innboks-dashboard, ikke per-økt).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { LiveOktCoachV2 } from "@/components/admin/v2/LiveOktCoachV2";
import { lastLiveOktData } from "@/lib/agencyos/live-okt-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live-økt · AgencyOS" };

export default async function LiveOktPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;
  const data = await lastLiveOktData(sessionId);
  if (!data) notFound();

  return (
    <V2Shell bredde="full" aktiv="live" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos/live">Live</TilbakeLenke>
      <LiveOktCoachV2 data={data} />
    </V2Shell>
  );
}
