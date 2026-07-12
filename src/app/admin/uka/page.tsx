/**
 * Redirect: /admin/uka → /admin/agencyos/uka (kanonisk adresse).
 * Dyplenker og gamle bokmerker skal aldri møte 404 (design-audit-funn 8).
 */
import { redirect } from "next/navigation";

export default function AdminUkaRedirect() {
  redirect("/admin/agencyos/uka");
}
