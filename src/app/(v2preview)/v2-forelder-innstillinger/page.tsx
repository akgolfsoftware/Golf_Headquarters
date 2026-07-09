/**
 * v2-forhåndsvisning — Foreldreportal · Innstillinger (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderInnstillingerV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/forelder/innstillinger/page.tsx): kun PARENT slippes inn, og koblede
 * barn hentes for samtykke-kontekst. Ingen data fabrikeres.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderInnstillingerV2,
  type ForelderInnstillingerData,
} from "@/components/portal/v2/ForelderInnstillingerV2";

export const dynamic = "force-dynamic";

export default async function V2ForelderInnstillingerPreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  const data: ForelderInnstillingerData = {
    navn: user.name,
    epost: user.email,
    telefon: user.phone ?? null,
    avatarUrl: user.avatarUrl,
    barn: barn.map((b) => ({
      id: b.child.id,
      navn: b.child.name,
      relasjon: b.relationship,
    })),
  };

  return (
    <V2Shell
      aktiv="oversikt"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderInnstillingerV2 data={data} />
    </V2Shell>
  );
}
