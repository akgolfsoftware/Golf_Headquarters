/**
 * /admin/audit-log — alias-rute til /admin/audit.
 *
 * Bølge D: designet i `04-revisjonslogg-default.html` refererer til
 * "audit-log"-ruten. Vi beholder eksisterende `audit/page.tsx` som
 * implementasjon og re-eksporterer den her slik at begge URL-er
 * fungerer.
 */

import AuditPage from "@/app/admin/audit/page";

export const dynamic = "force-dynamic";

export default AuditPage;
