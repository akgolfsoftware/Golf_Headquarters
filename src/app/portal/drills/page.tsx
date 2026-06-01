/**
 * /portal/drills — PlayerHQ Drill-bibliotek
 *
 * Mobil-first bibliotek (430px) portet fra
 * public/design-handover/playerhq/components-drill-bibliotek.html.
 *
 * Data: ekte SYSTEM-drills fra ExerciseDefinition via getDrillLibrary().
 * Stjerne-rating finnes ikke i databasen og utelates bevisst (ingen falske tall).
 * Klikk på et kort åpner /portal/drills/[id].
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDrillLibrary } from "@/lib/portal-drills/drills-data";
import { DrillLibrary } from "@/components/portal/drills";

export const dynamic = "force-dynamic";

export default async function DrillBibliotekPage() {
  await requirePortalUser();

  const drills = await getDrillLibrary();

  return (
    <div className="py-4">
      <DrillLibrary drills={drills} />
    </div>
  );
}
