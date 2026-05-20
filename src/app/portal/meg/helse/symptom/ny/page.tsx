/**
 * PlayerHQ · Meg · Helse · Legg til symptom
 *
 * Migrert fra public/design/batch3/legg-til-symptom.html.
 * 3-stegs wizard: kroppskart → intensitet/varighet → triggere/notat.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { SymptomWizard } from "./wizard";

export default async function NyttSymptomPage() {
  await requirePortalUser();
  return (
    <div className="space-y-6 pb-32">
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
