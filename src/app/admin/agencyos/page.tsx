/**
 * AgencyOS Daglig brief (/admin/agencyos) — operations cockpit.
 * Pixel-port av design-handover/agencyos/components-agency-dashboard.html.
 *
 * Server Component med live Prisma-data via loadDailyBrief.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DailyBrief } from "@/components/admin/agencyos/daily-brief";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";

export const dynamic = "force-dynamic";

export default async function AgencyOSPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const props = await loadDailyBrief({ id: user.id, name: user.name });
  return <DailyBrief {...props} />;
}
