import { redirect } from "next/navigation";

/**
 * /admin/elever (listevisning) er slått sammen med /admin/board til ny rute
 * /admin/spillere som har tabs Tabell / Tavle / Kart.
 *
 * Spiller-detalj-rutene under /admin/elever/[id]/... beholdes uendret.
 */
export default function EleverListeRedirect(): never {
  redirect("/admin/spillere?view=tabell");
}
