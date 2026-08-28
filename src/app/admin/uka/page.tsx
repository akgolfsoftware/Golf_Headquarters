/**
 * /admin/uka → kanonisk kalender (T7). Hopp over den pensjonerte
 * `/admin/agencyos/uka`-tavla.
 */
import { redirect } from "next/navigation";

export default function AdminUkaRedirect() {
  redirect("/admin/kalender");
}
