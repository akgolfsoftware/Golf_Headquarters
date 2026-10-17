/**
 * AgencyOS — Plan-hub (AG-14 i Precision Athletics, /admin/plan).
 *
 * Nytt design (pakke 4, natt 17.10.2026): docs/design-system/utkast-agencyos/workbench.html,
 * skjerm «AG-14 Maler og øvelser». Visningen er AG14PlanHubNy; lasteren er
 * hentPlanhub (src/lib/agencyos/planhub-data.ts).
 *
 * Én adresse for planarbeidet (MASTERPLAN 15.9): /admin/planlegge og
 * /admin/plan-templates sender hit, og /admin/plan/maler (full mal-liste med
 * filter, uke for uke og effekt) er nå fanene Ukemaler og Program her.
 * /admin/plan-templates/ny, /[id] og /[id]/rediger er fortsatt egne adresser.
 *
 * TILGANG — uendret: requirePortalUser({ allow: ["ADMIN", "COACH"] }), som
 * alle kildesidene hadde.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentPlanhub } from "@/lib/agencyos/planhub-data";
import { erPlanhubFane } from "@/lib/agencyos/planhub-typer";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG14PlanHubNy } from "@/components/admin/precision/AG14PlanHubNy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan · AgencyOS" };

export default async function AdminPlanPage({ searchParams }: { searchParams: Promise<{ fane?: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane } = await searchParams;
  const data = await hentPlanhub(user);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG14PlanHubNy data={data} startFane={erPlanhubFane(fane) ? fane : "ukemaler"} />
    </AgencyOSSkall>
  );
}
