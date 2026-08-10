/**
 * AgencyOS · Innboks (PP-2.2).
 *
 * Fasit: designsystem/paper/fase1/agencyos-innboks.html. Én liste med
 * filterpiller og ett detaljpanel — ikke fem faner. Rutene bak pillene lever
 * videre (/admin/godkjenninger, /admin/varsler, /admin/oppfolging,
 * /admin/handlingssenter); de nås fra ⌘K og fra «Åpne i …» på hver sak.
 * Derfor er KoHubNav borte fra DENNE skjermen, ikke fra appen.
 *
 * Server component. Samme requirePortalUser-guard (ADMIN/COACH) som før.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadInnboksSaker } from "@/lib/admin/innboks-saker";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { InnboksSaker } from "@/components/admin/v2/innboks/InnboksSaker";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innboks · AgencyOS" };

export default async function AdminInnboksPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await loadInnboksSaker({ id: user.id, role: user.role, name: user.name });

  return (
    <V2Shell bredde="full" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <InnboksSaker data={data} />
    </V2Shell>
  );
}
