/**
 * AgencyOS · Live (v2) — «Mission Control». V2-port av
 * src/app/admin/(legacy)/agencyos/live/page.tsx + mission-control.tsx.
 * Fortsatt et visuelt skall med statisk seed-data (src/lib/agencyos/live-data.ts) —
 * live-integrasjoner kobles senere. Auth arves fra AgencyOS (ADMIN/COACH).
 *
 * Server component (klientlogikken bor i AgencyLiveV2).
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AgencyLiveV2 } from "@/components/admin/v2/AgencyLiveV2";

export const metadata: Metadata = { title: "Mission Control · AgencyOS (v2)" };

export default async function V2LivePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coachFirstName = (user.name ?? "Coach").trim().split(/\s+/)[0];

  return (
    <V2Shell aktiv="live" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AgencyLiveV2 coachFirstName={coachFirstName} />
    </V2Shell>
  );
}
