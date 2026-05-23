/**
 * /admin/workspace/tildelt-meg — pixel-perfekt port av Claude Design Batch D
 * (bundle UVrLUCfdvIEV5yap-lh_pw / coachhq-stubs/workspace-tildelt-meg.html).
 *
 * Erstatter tidligere placeholder. Body rendres pixel-perfekt fra rå HTML
 * via dangerouslySetInnerHTML inni scopet .coachhq-stubs-scope.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WorkspaceTildeltMegScreen } from "@/components/coachhq-stubs-v2/screens";

export const dynamic = "force-dynamic";

export default async function WorkspaceTildeltMegPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return <WorkspaceTildeltMegScreen />;
}
