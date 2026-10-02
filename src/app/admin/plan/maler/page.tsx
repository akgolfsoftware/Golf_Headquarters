import { permanentRedirect } from "next/navigation";

/**
 * /admin/plan/maler → /admin/plan (AG-14 Plan-hub i Precision Athletics).
 *
 * Mal-lista er nå fanene Ukemaler og Program i Plan-hub, med det lista hadde:
 * status- og periodefilter, fordeling, uke for uke, bruk, effekt og lenker til
 * detalj, redigering, ny mal og utrulling. Se src/app/admin/plan/page.tsx.
 */
export default function AdminPlanMalerRedirect(): never {
  permanentRedirect("/admin/plan?fane=ukemaler");
}
