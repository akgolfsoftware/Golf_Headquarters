import { redirect } from "next/navigation";

/** Legacy → moderne turneringer. */
export default function LegacyRedirect() {
  redirect("/portal/tren/turneringer");
}
