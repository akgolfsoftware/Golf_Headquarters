import { permanentRedirect } from "next/navigation";

/**
 * /admin/plan-templates → /admin/plan (MASTERPLAN 15.9, AG-14 Plan-hub).
 *
 * Full mal-liste er fanene Ukemaler og Program i Plan-hub — se src/app/admin/plan/page.tsx.
 * `/admin/plan-templates/ny`, `/[id]` og `/[id]/rediger` er UENDRET på
 * denne adressen (samme mønster som `/admin/tournaments/ny` i MASTERPLAN
 * 15.6) — kun indekssiden flytter.
 */
export default function AdminPlanTemplatesRedirect(): never {
  permanentRedirect("/admin/plan");
}
