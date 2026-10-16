/**
 * Øvelsesbanken i AgencyOS (beslutning 16.10.2026, punkt 5): samme bank-side som spillerens
 * /portal/drills (PH-13), i AgencyOS-skallet, for coachens tilgang. Lenken «Hele øvelsesbanken»
 * i coachens Workbench fører hit.
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «bank», og workbench-ovelser.html.
 * Avvik:
 *   - Kortene åpner Øvelser i Plan-hub (AG-14), der coachen endrer og lager øvelser. «Ny egen øvelse»,
 *     Caddie-forslaget og break-tabellen er spillerens og er ikke med.
 * Øvelsene: AK Golf-banken, coachens egne og spillernes egne for spillerne coachen har tilgang til.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentOvelserForCoach } from "@/lib/portal-drills/ovelser-data";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { PH13DrillBank } from "@/components/portal/precision/PH13DrillBank";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øvelsesbank · AgencyOS" };

export default async function AdminOvelserPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const ovelser = await hentOvelserForCoach({ id: user.id, role: user.role });
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <PH13DrillBank ovelser={ovelser} caddie={null} coach />
    </AgencyOSSkall>
  );
}
