/**
 * AgencyOS Caddie / co-agent rammeverk (/admin/caddie).
 * Pixel-port av public/design-handover/agencyos/components-co-agent.html.
 *
 * Server Component med live Prisma-data via loadCoAgent. Auth-guard:
 * kun ADMIN/COACH (samme som resten av AgencyOS).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CoAgent } from "@/components/admin/caddie/co-agent";
import { loadCoAgent } from "@/lib/admin-caddie/co-agent-data";

export const dynamic = "force-dynamic";

export default async function CaddiePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const props = await loadCoAgent({ id: user.id, name: user.name });
  return <CoAgent {...props} />;
}
