import { redirect } from "next/navigation";

/**
 * /admin/plans/templates/[id]/effectiveness (gammel adresse) → /admin/plan-templates.
 * Mal-detaljsiden finnes bare i legacy-treet, så aliaset peker på mal-listen.
 */
export default function PlanTemplateEffectivenessRedirect(): never {
  redirect("/admin/plan-templates");
}
