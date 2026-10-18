import { redirect } from "next/navigation";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";

/**
 * Flyttet til Data Golf for coach i AgencyOS (pakke 10, 17.10).
 * Data Golf er bare for coach og admin: spiller og forelder sendes bort av vakten, uinnlogget til innlogging.
 */
export default async function DataGolfVideresending() {
  await krevDataGolfBruker("/stats/pga");
  redirect("/admin/datagolf/topplister");
}
