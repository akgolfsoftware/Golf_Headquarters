/**
 * /admin/bookinger — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/bookinger.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { BookingerScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function BookingerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <BookingerScreen />;
}
