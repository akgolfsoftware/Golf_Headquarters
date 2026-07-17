import { redirect } from "next/navigation";

/**
 * /portal/stats (gammel adresse) → /portal/statistikk.
 * Statistikk er kanonisk på norsk adresse (serveres foreløpig fra legacy-treet).
 */
export default function StatsRedirect(): never {
  redirect("/portal/statistikk");
}
