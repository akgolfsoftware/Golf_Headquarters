/**
 * AG-07 Stall i Precision Athletics (`/admin/spillere`).
 *
 * Auth + data følger den ekte flaten uendret: samme requirePortalUser-guard
 * (ADMIN/COACH) og loadStallen-loaderen, via loadStallPrecision som legger
 * på «trener nå» og avtale-utløp (se src/lib/admin/stall-precision-data.ts).
 * Bare visningen er byttet fra V2Shell/TrainLockStall til AgencyOSSkall/AG07Stall.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadStallPrecision } from "@/lib/admin/stall-precision-data";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG07Stall } from "@/components/admin/precision/AG07Stall";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stall · AgencyOS" };

const GRUPPE_FILTER = [
  { id: "alle", label: "Alle" },
  { id: "WANG", label: "WANG" },
  { id: "GFGK", label: "GFGK" },
  { id: "AKA", label: "AKA" },
] as const;

export default async function StallPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { total, iDag, trenerNaa, heleStallen } = await loadStallPrecision({ id: user.id, role: user.role }, {});

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG07Stall
        tilstand={total === 0 ? "tom" : "data"}
        total={total}
        iDag={iDag}
        trenerNaa={trenerNaa}
        heleStallen={heleStallen}
        nyttGruppeFilter={GRUPPE_FILTER}
      />
    </AgencyOSSkall>
  );
}
