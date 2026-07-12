import { redirect } from "next/navigation";

/**
 * /admin/tilstander → /admin/gjennomfore (B7, 2026-07-12).
 * Var en statisk designkatalog over økt-tilstander med hardkodet demo-data —
 * ikke en produktflate. Katalog-verdien er dekket av docs/skjermtekst.
 */
export default function TilstanderRedirect(): never {
  redirect("/admin/gjennomfore");
}
