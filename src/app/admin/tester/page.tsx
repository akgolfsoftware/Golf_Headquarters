/**
 * CoachHQ · Tester · Stall-oversikt — pixel-perfekt Claude Design-port
 * docs/design-handoff/test-modul/coach-tester-stall.html
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CoachTesterStallScreen } from "@/components/test-modul-v2/coach-tester-stall-screen";

export const dynamic = "force-dynamic";

export default async function AdminTesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <CoachTesterStallScreen />;
}
