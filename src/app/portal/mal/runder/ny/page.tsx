/**
 * PlayerHQ · Mål · Runder · Ny (manuell registrering)
 *
 * Mobil-first score-input — pixel-port av
 * public/design-handover/playerhq/components-runde-ny.html.
 * Steg-vis registrering av runde som ikke kom via GolfBox.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { RundeNyForm } from "@/components/portal/runde-ny/runde-ny-form";

export default async function NyRundePage() {
  await requirePortalUser();
  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, par: true },
  });

  return (
    <div className="px-4 pb-32 pt-2 sm:px-6">
      <RundeNyForm courses={courses} />
    </div>
  );
}
