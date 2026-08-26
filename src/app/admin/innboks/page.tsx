/**
 * AgencyOS · Innboks — Train-lock (T3, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-03 Innboks.dc.html. Én liste med to
 * seksjoner (Godkjenninger/Meldinger) og ett inspektørpanel på desktop —
 * erstatter InnboksSaker (Paper). /admin/varsler er nå en redirect hit med
 * `?filter=varsler` (se src/app/admin/varsler/page.tsx) — samme data, samme
 * skjerm, ikke lenger en egen rute/duplikat.
 *
 * Server component. Samme requirePortalUser-guard (ADMIN/COACH) som før.
 */

import { Suspense } from "react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadInnboksSaker } from "@/lib/admin/innboks-saker";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { InnboksSakerTrainLock } from "@/components/admin/v2/innboks/InnboksSakerTrainLock";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innboks · AgencyOS" };

export default async function AdminInnboksPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await loadInnboksSaker({ id: user.id, role: user.role, name: user.name });

  return (
    <V2Shell bredde="full" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      {/* useSearchParams() (filter=varsler) krever en Suspense-grense rundt klientkomponenten. */}
      <Suspense fallback={null}>
        <InnboksSakerTrainLock data={data} />
      </Suspense>
    </V2Shell>
  );
}
