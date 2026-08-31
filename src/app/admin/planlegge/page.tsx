import { permanentRedirect } from "next/navigation";

/**
 * /admin/planlegge → /admin/plan (MASTERPLAN 15.9).
 *
 * Plan-hub flyttet 1:1 til den nye samleadressen — se
 * src/app/admin/plan/page.tsx for innhold og begrunnelse.
 */
export default function AdminPlanleggeRedirect(): never {
  permanentRedirect("/admin/plan");
}
