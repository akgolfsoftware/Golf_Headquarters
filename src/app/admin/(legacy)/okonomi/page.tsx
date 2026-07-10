import { redirect } from "next/navigation";

/**
 * /admin/okonomi er erstattet av /admin/agencyos/okonomi (v2).
 * Ren redirect så gammel URL ikke lenger viser gammelt design.
 */
export default function OkonomiRedirect(): never {
  redirect("/admin/agencyos/okonomi");
}
