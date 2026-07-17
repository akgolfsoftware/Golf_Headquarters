import { redirect } from "next/navigation";

/**
 * /admin/plans/templates (gammel adresse) → /admin/plan-templates.
 * Plan-maler er kanonisk på egen toppadresse.
 */
export default function PlanTemplatesRedirect(): never {
  redirect("/admin/plan-templates");
}
