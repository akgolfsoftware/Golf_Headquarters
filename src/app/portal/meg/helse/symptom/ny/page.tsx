/**
 * PlayerHQ · Meg · Helse · Legg til symptom
 *
 * Migrert fra public/design/batch3/legg-til-symptom.html.
 * 3-stegs wizard: kroppskart → intensitet/varighet → triggere/notat.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { SymptomWizard } from "./wizard";

export default async function NyttSymptomPage() {
  await requirePortalUser();
  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-32 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Helse"
        titleLead="Legg til"
        titleItalic="symptom"
        sub="Logg hvor du kjenner det, hvor sterkt og hva som utløser det — coach og fysio bruker dataene til prioritering."
      />
      <SymptomWizard />
    </div>
  );
}
