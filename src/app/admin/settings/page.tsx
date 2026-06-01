/**
 * /admin/settings — Drift-panel (CoachHQ).
 * Pixel-port av design-handover/agencyos/components-agency-drift.html.
 * Accordion-hub: Team + Plan-maler (åpne) + øvrige drift-seksjoner.
 *
 * Server Component med live Prisma-data via loadDriftData.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DriftPanel } from "@/components/admin/settings/drift-panel";
import { loadDriftData } from "@/lib/admin/drift-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await loadDriftData({ id: user.id, name: user.name });
  return <DriftPanel data={data} />;
}
