/**
 * /admin/tester — AgencyOS Tester på tvers (spillere × tester ytelse-matrise) — v10-design.
 *
 * Rendrer <TesterOversikt> (v10-fasit fra ag-tester.png) med EKTE data fra
 * loadTesterMatrix (Prisma). mapTesterOversikt oversetter loaderens TesterMatrixData
 * til v10-komponentens TesterOversiktData og bevarer alle tom-tilstander (umålte
 * celler = "IKKE TESTET", manglende mål = ingen fargekode).
 *
 * Server Component. Auth-guard via requirePortalUser({ allow: ["COACH","ADMIN"] }).
 *
 * 3. juni: byttet fra TesterMatrix (eldre design) til TesterOversikt (v10).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TesterOversikt } from "@/components/admin/tester/tester-oversikt";
import { loadTesterMatrix } from "@/lib/admin/tester-matrix-data";
import { mapTesterOversikt } from "./map-tester-oversikt";

export const dynamic = "force-dynamic";

export default async function AdminTesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await loadTesterMatrix();
  return <TesterOversikt data={mapTesterOversikt(data)} />;
}
