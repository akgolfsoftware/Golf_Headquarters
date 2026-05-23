/**
 * /admin/godkjenninger — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/godkjenninger.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { GodkjenningerScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function GodkjenningerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <GodkjenningerScreen />;
}
