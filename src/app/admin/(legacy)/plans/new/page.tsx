import { redirect } from "next/navigation";

/**
 * /admin/plans/new → /admin/planlegge (B7, 2026-07-12).
 * Plan-oppretting skjer i Workbench (låst beslutning: Planlegge er ETT
 * trykkpunkt dit). Den gamle PlanBuilder-flaten var ikke lenket fra /plans.
 */
export default function PlansNewRedirect(): never {
  redirect("/admin/planlegge");
}
