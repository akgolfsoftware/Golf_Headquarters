/**
 * AgencyOS · Caddie (/admin/agencyos/caddie) — v10-design (co-agent rammeverk).
 *
 * Rendrer <Caddie> (v10-fasit fra ag-caddie.png / components-co-agent.html).
 * Det finnes ingen co-agent-datamodell ennå (fleet/utkast/audit kobles på i
 * fase 3, jf. caddie.tsx-doc). Derfor rendres komponenten i TOM-TILSTAND:
 *   - draft: null  → "Ingen utkast venter"
 *   - fleet: []    → "Ingen agent-kjøringer registrert"
 *   - audit: []    → "Ingen hendelser ennå"
 * Ingen liksom-tall. Coach-fornavn hentes fra innlogget bruker; dato/tid er
 * presentasjonell chrome (nåtid), ikke forretningsdata.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["ADMIN","COACH"] }).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Caddie } from "@/components/admin/caddie/caddie";

export const dynamic = "force-dynamic";

const DATE_FMT = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const TIME_FMT = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
});

export default async function CaddieTabPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const coachFirstName = user.name.trim().split(/\s+/)[0] || "coach";
  const now = new Date();

  return (
    <Caddie
      coachFirstName={coachFirstName}
      dateLabel={DATE_FMT.format(now).toUpperCase()}
      timeLabel={TIME_FMT.format(now)}
      draft={null}
      fleet={[]}
      fleetSummary={{ total: 0, active: 0, draft: 0, avgAccuracy: null, runs7d: 0 }}
      audit={[]}
    />
  );
}
