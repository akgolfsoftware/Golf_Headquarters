/**
 * PlayerHQ · Mål · Runder · Ny (manuell registrering)
 *
 * Migrert fra public/design/batch3/legg-til-runde-manuelt.html.
 * Steg-vis registrering av runde som ikke kom via GolfBox.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { LeggTilRundeForm } from "./form";

export default async function NyRundePage() {
  const user = await requirePortalUser();
  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, par: true },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-32 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · Runder"
        titleLead="Legg til"
        titleItalic="runde"
        sub="Registrer en runde som ikke kom via GolfBox — utenlandsk bane, vennegolf eller treningsrunde. Vi beregner over-par og stableford automatisk."
      />

      <LeggTilRundeForm
        userName={user.name ?? "Spiller"}
        courses={courses}
      />
    </div>
  );
}
