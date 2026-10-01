/**
 * /team-wang/rekruttering — viste oppdiktede kandidater uten innlogging (26.09.2026).
 * Trenerflaten ligger bak innlogging under /team-wang/coach.
 */

import { redirect } from "next/navigation";

export default function WangRekrutteringRedirect() {
  redirect("/team-wang/coach");
}
