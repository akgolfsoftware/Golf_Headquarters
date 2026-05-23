/**
 * /admin/talent/wagr-import — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/wagr-import.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WagrImportScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function WagrImportPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <WagrImportScreen />;
}
