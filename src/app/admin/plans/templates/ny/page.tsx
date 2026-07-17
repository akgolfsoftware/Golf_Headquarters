import { redirect } from "next/navigation";

/**
 * /admin/plans/templates/ny (gammel adresse) → /admin/plan-templates.
 * Ny-mal-siden finnes bare i legacy-treet, så aliaset peker på mal-listen.
 */
export default function PlanTemplateNyRedirect(): never {
  redirect("/admin/plan-templates");
}
