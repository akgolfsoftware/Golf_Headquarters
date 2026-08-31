import { permanentRedirect } from "next/navigation";

/**
 * /admin/plan-templates → /admin/plan/maler (MASTERPLAN 15.9).
 *
 * Full mal-liste flyttet 1:1 — se src/app/admin/plan/maler/page.tsx.
 * `/admin/plan-templates/ny`, `/[id]` og `/[id]/rediger` er UENDRET på
 * denne adressen (samme mønster som `/admin/tournaments/ny` i MASTERPLAN
 * 15.6) — kun indekssiden flytter.
 */
export default function AdminPlanTemplatesRedirect(): never {
  permanentRedirect("/admin/plan/maler");
}
