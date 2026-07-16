/**
 * /admin/stats/moderering — coach modereringskø (design 20). v2-port 16. juli 2026.
 *
 * Krever ADMIN eller COACH.
 * Viser:
 *   - Hero med kø-status
 *   - KPI-strip (ventende, godkjent, avvist, snitt-tid)
 *   - Tab-bar: Turneringer · Resultater · Profil-endringer · Slett-forespørsler · Historikk
 *   - Stub-tabeller per tab
 *   - GDPR-slett-flow under "Slett"-fanen
 *   - Sticky batch-bar
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ModeringClientV2 } from "@/components/admin/v2/AdminStatsModereringV2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats moderering | AgencyOS",
  description: "Modereringskø for AK Golf Stats.",
  robots: { index: false },
};

export default async function ModeringPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Det finnes ennå ingen modererings- eller GDPR-slett-kø i datamodellen.
  // Vis ærlige tomme tilstander framfor oppdiktede saker — en GDPR-skjerm
  // skal aldri vise falske slett-forespørsler.
  return (
    <ModeringClientV2
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
  );
}
