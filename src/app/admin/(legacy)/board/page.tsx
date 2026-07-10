import { redirect } from "next/navigation";

/**
 * /admin/board er slått sammen med /admin/elever (listevisning) til ny rute
 * /admin/spillere?view=tavle.
 */
export default function BoardRedirect(): never {
  redirect("/admin/spillere?view=tavle");
}
