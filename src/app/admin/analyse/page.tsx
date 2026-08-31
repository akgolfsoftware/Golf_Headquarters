/**
 * Analyse (Innsikt) — ÉN adresse (MASTERPLAN 15.8, beslutning 6.9 «én
 * inngang per funksjon»).
 *
 * Slår sammen TRE adresser: `/admin/analyse` (fane «stall», InnsiktHubV2 —
 * uendret standardvisning), `/admin/analyse/stall` (nestet `?visning=trend`
 * under «stall», InnsiktStallV2) og `/admin/analysere/compliance` (fane
 * «etterlevelse», AdminComplianceV2). Alle tre gamle adresser er nå
 * redirects hit — se hver enkelt fil.
 *
 * AVVIK FRA CANVASEN og fra en literal lesning av MASTERPLAN-raden — se
 * `src/lib/admin/analyse/faner.ts` filhode for full begrunnelse:
 *   - «Tester»-pillen i `Analyse.dc.html` er IKKE bygget som fane her.
 *     `/admin/tester` er en egen, allerede fungerende funksjon utenfor
 *     15.8s kildeliste (tre navngitte adresser) — å trekke den inn ville
 *     vært scope creep.
 *   - Standardfanen er «stall», ikke «spiller» slik canvasen tegner —
 *     `V2Shell`s sitewide nav-destinasjon «Innsikt» og flere andre steder
 *     lenker bart til `/admin/analyse` i forventning om stall-oversikten.
 *
 * TILGANG — IKKE UTVIDET: alle tre kildesider hadde IDENTISK gate
 * (`requirePortalUser({ allow: ["ADMIN", "COACH"] })` + coach-scoping via
 * `coachScopedPlayerWhere`). Sammenslåingen utvider derfor ikke tilgang for
 * noen fane. Låst av `src/lib/admin/analyse/faner.test.ts`.
 *
 * Design: canvas godkjent 30.08.2026 —
 * designsystem/canvas/agencyos-ia/Analyse.dc.html («Innsikt (15.8)»).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadComplianceData } from "@/lib/admin-compliance/compliance-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AnalyseHode } from "@/components/admin/v2/analyse/AnalyseHode";
import { InnsiktHubV2 } from "@/components/admin/v2/InnsiktHubV2";
import { InnsiktStallV2 } from "@/components/admin/v2/InnsiktStallV2";
import { AdminComplianceV2 } from "@/components/admin/v2/AdminComplianceV2";
import { InnsiktSpillerListe } from "@/components/admin/v2/analyse/InnsiktSpillerListe";
import { ANALYSE_FANER, velgAnalyseFane } from "@/lib/admin/analyse/faner";
import { lastInnsiktHub, lastInnsiktSpillere, lastInnsiktStall } from "@/lib/admin/analyse/lastere";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innsikt · AgencyOS" };

function windowDaysFra(periode: string | undefined): { days: number; label: string } {
  switch (periode) {
    case "7d":
      return { days: 7, label: "Siste 7 dager" };
    case "90d":
      return { days: 90, label: "Siste 90 dager" };
    case "365d":
      return { days: 365, label: "Siste 365 dager" };
    default:
      return { days: 30, label: "Siste 30 dager" };
  }
}

type SearchParams = Promise<{ fane?: string; visning?: string; periode?: string; studentId?: string }>;

export default async function V2AdminAnalysePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const params = await searchParams;
  const aktiv = velgAnalyseFane(params.fane);

  const spillereForTeller = await lastInnsiktSpillere(user);
  const antall = { stall: spillereForTeller.length, spiller: spillereForTeller.length };
  const hode = <AnalyseHode faner={ANALYSE_FANER} aktiv={aktiv} antall={antall} />;

  const innhold = await (async () => {
    switch (aktiv) {
      case "spiller":
        return <InnsiktSpillerListe spillere={spillereForTeller} />;
      case "stall": {
        if (params.visning === "trend") {
          const data = await lastInnsiktStall(user);
          return <InnsiktStallV2 data={data} somFane />;
        }
        const data = await lastInnsiktHub(user);
        return <InnsiktHubV2 data={data} somFane />;
      }
      case "etterlevelse": {
        const { days, label } = windowDaysFra(params.periode);
        const data = await loadComplianceData({
          windowDays: days,
          periodLabel: label,
          selectedPlayerId: params.studentId,
          viewer: user,
        });
        return <AdminComplianceV2 data={data} somFane />;
      }
    }
  })();

  return (
    <V2Shell bredde="kolonne" aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        {hode}
        {innhold}
      </div>
    </V2Shell>
  );
}
