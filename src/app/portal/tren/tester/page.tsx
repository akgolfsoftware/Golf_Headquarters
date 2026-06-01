/**
 * PlayerHQ · Tren · Tester — egen test-oversikt med ekte data.
 *
 * Port av public/design-handover/playerhq/components-test-week.html (mobile-first).
 * Data fra Prisma (TestResult, TestDefinition, TestSession) via loadTesterScreen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { TesterScreen } from "@/components/portal/tester/tester-screen";

export const dynamic = "force-dynamic";

export default async function TesterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const data = await loadTesterScreen({
    id: user.id,
    name: user.name,
    hcp: user.hcp,
    tier: user.tier,
  });

  return <TesterScreen data={data} />;
}
