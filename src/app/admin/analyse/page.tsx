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
 *
 * AG-A03 (30.09.2026): fanene «stall» og «etterlevelse» er portert til Precision
 * Athletics (AGA03Analyse, tegning AG-A1.jsx). «spiller», «treningsdata»,
 * `?visning=trend` og `?visning=detalj` (spillerpanel og øvelser) vises
 * uendret i samme skall. Etterlevelse følger minutt-regelen over 4 uker.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadComplianceData } from "@/lib/admin-compliance/compliance-data";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AGA03Analyse } from "@/components/admin/precision/AGA03Analyse";
import { InnsiktStallV2 } from "@/components/admin/v2/InnsiktStallV2";
import { AdminComplianceV2 } from "@/components/admin/v2/AdminComplianceV2";
import { InnsiktSpillerListe } from "@/components/admin/v2/analyse/InnsiktSpillerListe";
import { WorkbenchAnalyseV2 } from "@/components/admin/v2/analyse/WorkbenchAnalyseV2";
import { velgAnalyseFane } from "@/lib/admin/analyse/faner";
import { lastInnsiktHub, lastInnsiktSpillere, lastInnsiktStall, lastWorkbenchAnalyse } from "@/lib/admin/analyse/lastere";
import { lastGruppeAnalyse, TOM_GRUPPE_ANALYSE } from "@/lib/admin/analyse/gruppe-analyse";

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
  const visGruppetall = (aktiv === "stall" && params.visning !== "trend") || (aktiv === "etterlevelse" && params.visning !== "detalj");
  const analyse = visGruppetall ? await lastGruppeAnalyse(user) : TOM_GRUPPE_ANALYSE;

  let hub = null;
  let eldre: React.ReactNode | undefined;
  switch (aktiv) {
    case "spiller":
      eldre = <InnsiktSpillerListe spillere={spillereForTeller} />;
      break;
    case "stall":
      if (params.visning === "trend") eldre = <InnsiktStallV2 data={await lastInnsiktStall(user)} somFane />;
      else hub = await lastInnsiktHub(user);
      break;
    case "treningsdata":
      eldre = <WorkbenchAnalyseV2 data={await lastWorkbenchAnalyse(user)} />;
      break;
    case "etterlevelse":
      if (params.visning === "detalj") {
        const { days, label } = windowDaysFra(params.periode);
        const data = await loadComplianceData({ windowDays: days, periodLabel: label, selectedPlayerId: params.studentId, viewer: user });
        eldre = <AdminComplianceV2 data={data} somFane />;
      }
      break;
  }

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AGA03Analyse
        tilstand={spillereForTeller.length === 0 || (aktiv === "stall" && visGruppetall && analyse.grupper.length === 0) ? "tom" : "data"}
        fane={aktiv}
        hub={hub}
        analyse={analyse}
        eldre={eldre}
      />
    </AgencyOSSkall>
  );
}
