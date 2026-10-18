/** DG-01 Oversikt — Data Golf for coach (AgencyOS pakke 10). Bare coach og admin. */
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { DG01Oversikt } from "@/components/admin/precision/AGDataGolf";
import { erForsinket, hentOversikt } from "@/lib/admin/datagolf/coach-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Data Golf · AgencyOS" };

export default async function DataGolfOversiktPage() {
  const user = await krevDataGolfBruker("/admin/datagolf");
  const d = await hentOversikt();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><DG01Oversikt d={{ ...d, forsinket: erForsinket(d.sistSynk ?? d.kildedato) }} /></AgencyOSSkall>;
}
