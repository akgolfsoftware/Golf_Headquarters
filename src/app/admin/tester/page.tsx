/**
 * /admin/tester — AgencyOS Tester-matrise (spillere × tester ytelse-matrise).
 * Port av public/design-handover/agencyos/components-agency-tests.html.
 *
 * Server Component med live Prisma-data via loadTesterMatrix.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TesterMatrix } from "@/components/admin/tester/tester-matrix";
import { loadTesterMatrix } from "@/lib/admin/tester-matrix-data";

export const dynamic = "force-dynamic";

export default async function AdminTesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await loadTesterMatrix();
  return <TesterMatrix data={data} />;
}
