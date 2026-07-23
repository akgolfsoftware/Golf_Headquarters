import { redirect } from "next/navigation";

/** Legacy → moderne PlayerHQ-rute (B / v2). */
export default function LegacyRedirect() {
  redirect("/portal/coach/ovelser");
}
