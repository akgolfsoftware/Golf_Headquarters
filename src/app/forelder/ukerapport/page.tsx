/**
 * v2-forhåndsvisning — Foreldreportal · Ukerapport (detalj, retning C). Egen
 * top-level route-group (v2preview) som IKKE arver forelder-layouten — kun
 * root-layout. V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV),
 * ForelderUkerapportV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/forelder/ukerapport/page.tsx): kun PARENT slippes inn, og
 * ukerapporten hentes for det første koblede barnet.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentForelderUkerapport } from "@/lib/forelder";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import { ForelderUkerapportV2 } from "@/components/portal/v2/ForelderUkerapportV2";
import { TomTilstand } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function V2ForelderUkerapportPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const data = await hentForelderUkerapport(user.id);

  return (
    <V2Shell
      aktiv="oversikt"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      {data ? (
        <ForelderUkerapportV2 data={data} />
      ) : (
        <TomTilstand
          icon="users"
          title="Ingen barn er koblet ennå"
          sub="Be coachen om en forelder-invitasjon, så dukker barnets ukerapport opp her."
        />
      )}
    </V2Shell>
  );
}
