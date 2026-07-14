/**
 * AgencyOS — Stats-moderering (`/admin/stats/moderering`), v2.
 * Port av `(legacy)/stats/moderering/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.18). Ingen moderings-/GDPR-slett-kø finnes i datamodellen ennå —
 * ærlige tomme tilstander (0-tall, tomme lister), samme som legacy.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminStatsModereringV2 } from "@/components/admin/v2/AdminStatsModerering2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats moderering | AgencyOS",
  description: "Modereringskø for AK Golf Stats.",
  robots: { index: false },
};

export default async function ModeringPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminStatsModereringV2
        turneringer={[]}
        slett={null}
        stats={{
          turneringer: 0,
          resultater: 0,
          profilEndringer: 0,
          slett: 0,
          godkjentDenneUka: 0,
          avvistDenneUka: 0,
          snittTid: "—",
        }}
      />
    </V2Shell>
  );
}
