/**
 * v2-forhåndsvisning — Foreldreportal · Coach (Meldinger, retning C). Egen
 * top-level route-group (v2preview) som IKKE arver forelder-layouten — kun
 * root-layout. V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV),
 * ForelderCoachV2 rendrer innholds-stacken.
 *
 * Auth gjenbrukt 1:1 fra den ekte siden (src/app/forelder/coach/page.tsx): kun
 * PARENT slippes inn. Skjermen har ingen dataloader — coach-dialogen er ikke
 * ferdig for beta — så vi sender de samme hardkodede beta-verdiene som den ekte
 * siden bruker (lansering + support-adresse), aldri fabrikkerte meldinger.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderCoachV2,
  type ForelderCoachData,
} from "@/components/portal/v2/ForelderCoachV2";

export const dynamic = "force-dynamic";

const DATA: ForelderCoachData = {
  lansering: "Q3 2026",
  supportEpost: "support@akgolf.no",
};

export default async function V2ForelderCoachPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  return (
    <V2Shell
      aktiv="coach"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderCoachV2 data={DATA} />
    </V2Shell>
  );
}
