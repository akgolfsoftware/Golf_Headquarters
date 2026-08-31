import { permanentRedirect } from "next/navigation";

/**
 * /admin/teknisk-plan → /admin/plan/teknisk (MASTERPLAN 15.9).
 *
 * Oversikten flyttet 1:1 — se src/app/admin/plan/teknisk/page.tsx.
 */
export default function AdminTekniskPlanRedirect(): never {
  permanentRedirect("/admin/plan/teknisk");
}
