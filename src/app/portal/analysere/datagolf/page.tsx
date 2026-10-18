import { redirect } from "next/navigation";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";

/**
 * DG-01 for coach bor i AgencyOS (pakke 10). Stasjonen (./stasjon) er fortsatt innspill mot proffens tall.
 * Data Golf er bare for coach og admin: spiller og forelder sendes bort av vakten, uinnlogget til innlogging.
 */
export default async function DataGolfVideresending() {
  await krevDataGolfBruker("/portal/analysere/datagolf");
  redirect("/admin/datagolf");
}
