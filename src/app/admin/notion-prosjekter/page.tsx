/**
 * /admin/notion-prosjekter — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/notion-prosjekter.html).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { NotionProsjekterScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function NotionProsjekterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <NotionProsjekterScreen />;
}
