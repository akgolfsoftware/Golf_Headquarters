/**
 * /portal/drills — PlayerHQ Drill-bibliotek (v10-design).
 *
 * Rendrer <DrillBibliotek> (v10-fasit fra pl-drills) med EKTE data fra
 * getDrillLibrary() (Prisma · ExerciseDefinition, source=SYSTEM).
 * mapDrills oversetter loaderens DrillCard-shape til v10-komponentens prop-shape.
 *
 * Tom database → tom liste; komponenten viser ærlig tom-tilstand. Ingen falske
 * tall: stjerne-rating finnes ikke i databasen og utelates bevisst.
 *
 * Server component. Auth-guard via requirePortalUser. Klikk på et kort åpner
 * /portal/drills/[id].
 *
 * Bolk (3. juni): byttet fra DrillLibrary (eldre design) til DrillBibliotek (v10).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  getDrillLibrary,
  type DrillCard as LoaderDrillCard,
} from "@/lib/portal-drills/drills-data";
import {
  DrillBibliotek,
  type DrillCard,
} from "@/components/portal/drills/drill-bibliotek";

export const dynamic = "force-dynamic";

/** Oversetter loaderens DrillCard → v10 DrillCard. Fasilitet-enum → string[]. */
function mapDrills(rows: LoaderDrillCard[]): DrillCard[] {
  return rows.map((d) => ({
    id: d.id,
    axis: d.axis,
    axisLabel: d.axisLabel,
    title: d.title,
    meta: d.meta,
    difficulty: d.difficulty,
    fasilitet: d.fasilitet as string[],
    chsLink: d.chsLink,
  }));
}

export default async function DrillBibliotekPage() {
  const user = await requirePortalUser();

  const drills = await getDrillLibrary(user.id);

  return (
    <div className="py-4">
      <DrillBibliotek drills={mapDrills(drills)} />
    </div>
  );
}
