import { redirect } from "next/navigation";

/** /admin/plan-templates/[id]/effectiveness (legacy) → plan-maler (v2). */
export default function PlanTemplateEffectivenessRedirect(): never {
  redirect("/admin/plan-templates");
}
