/**
 * /admin/plan-templates — redirect til canonical plans/templates-rute
 *
 * Backstop-redirect i tilfelle next.config.ts ikke fanger requesten.
 */

import { redirect } from "next/navigation";

export default function PlanTemplatesPage() {
  redirect("/admin/plans/templates");
}
