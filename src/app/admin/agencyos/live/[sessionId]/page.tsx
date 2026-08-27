/**
 * AgencyOS · Live-økt (coach). Paper-fasit: fase1/agencyos-live-session.html.
 * «UNDER-flata mens økta pågår» — søsterflate til FangstSheet, men for
 * coachen. Skilt fra /admin/agencyos/live (Mission Control), som er en
 * annen flate (tverrgående innboks-dashboard, ikke per-økt).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { LiveOktCoachTrainLock } from "@/components/admin/v2/LiveOktCoachTrainLock";
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
      <Link
        href="/admin/agencyos/live"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, textDecoration: "none", marginBottom: 12 }}
      >
        <Icon name="arrow-left" size={15} />
        Tavle
      </Link>
      <LiveOktCoachTrainLock data={data} />
    </V2Shell>
  );
}
