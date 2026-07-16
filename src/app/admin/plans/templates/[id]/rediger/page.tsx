import { redirect } from "next/navigation";

/**
 * /admin/plans/templates/[id]/rediger (gammel adresse) → /admin/plan-templates.
 * Rediger-siden finnes bare i legacy-treet, så aliaset peker på mal-listen.
 */
export default function PlanTemplateRedigerRedirect(): never {
  redirect("/admin/plan-templates");
}
