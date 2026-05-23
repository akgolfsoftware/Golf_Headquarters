/**
 * /admin/settings — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/settings.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SettingsScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <SettingsScreen />;
}
