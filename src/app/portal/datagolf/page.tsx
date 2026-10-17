import { redirect } from "next/navigation";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";

/**
 * Gammel adresse. DG-01 for coach bor i AgencyOS (pakke 10).
 * Data Golf er bare for coach og admin: spiller og forelder sendes bort av vakten, uinnlogget til innlogging.
 */
export default async function DataGolfVideresending() {
  await krevDataGolfBruker("/portal/datagolf");
  redirect("/admin/datagolf");
}
