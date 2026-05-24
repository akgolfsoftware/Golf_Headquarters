/**
 * /admin/godkjenninger — alias-rute til /admin/approvals.
 *
 * Pixel-perfekt PR6-implementasjonen lever i `/admin/approvals` (full
 * agent-inbox med severity, ApprovalActions, KPI-strip). Vi re-eksporterer
 * den her for å holde URL-strukturen konsistent med navigasjon på norsk
 * og samtidig unngå duplisert logikk.
 */

import ApprovalsPage from "@/app/admin/approvals/page";

export const dynamic = "force-dynamic";

export default ApprovalsPage;
