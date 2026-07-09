/**
 * AgencyOS Cockpit (/admin/agencyos) — fersk design-fasit (juni 2026).
 *
 * Rendrer <AgencyCockpit> med EKTE data fra loadDailyBrief (Prisma).
 * 3-kolonne Bloomberg-cockpit: dagens timeline, innboks + oppgaver,
 * trenger-oppmerksomhet (pin + AI-forslag) + 4 business-KPIer.
 *
 * loadDailyBrief returnerer CockpitData direkte (serialiserbar — ikoner
 * som navn, rik tekst som segmenter), så siden er kun auth + lasting.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["ADMIN","COACH"] }).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { AgencyCockpit } from "@/components/admin/cockpit/agency-cockpit";

export const dynamic = "force-dynamic";

export default async function AgencyOSPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await loadDailyBrief({ id: user.id, name: user.name });
  return <AgencyCockpit data={data} />;
}
