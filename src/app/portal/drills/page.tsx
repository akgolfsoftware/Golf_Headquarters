/**
 * /portal/drills — PlayerHQ Drill-galleri (hybrid design 2026-06-17).
 *
 * Server component: henter drills via getDrillLibrary (Prisma), mapper til
 * DrillCard-shape og sender til <DrillGallery> (klientkomponent).
 *
 * Layout: 2-kol grid med forest-gradient thumbnail, filter-pills (Alle/FYS/TEK/SLAG/SPILL/TURN),
 * vanskelighetsgrad-badge. Klikk → /portal/drills/[id].
 *
 * Beholder all eksisterende data-henting fra getDrillLibrary. Tom database → tom liste.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  getDrillLibrary,
  type DrillCard as LoaderDrillCard,
} from "@/lib/portal-drills/drills-data";
import {
  DrillGallery,
  type DrillCard,
} from "@/components/portal/drills/drill-gallery";

export const dynamic = "force-dynamic";

/** Oversetter loaderens DrillCard → DrillGallery DrillCard. */
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

export default async function DrillGalleryPage() {
  const user = await requirePortalUser();

  const drills = await getDrillLibrary(user.id);

  return (
    <div className="py-4">
      <DrillGallery drills={mapDrills(drills)} />
    </div>
  );
}
