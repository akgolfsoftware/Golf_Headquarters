/**
 * /team-wang/rekruttering — gammel adresse. Rekrutteringen er WANG-31 under
 * Administrasjon (bare Sportssjef), bak innloggingen.
 */

import { redirect } from "next/navigation";

import { wangHref } from "@/lib/wang/wang-ruter";

export default function WangRekrutteringRedirect() {
  redirect(wangHref("WANG-31"));
}
