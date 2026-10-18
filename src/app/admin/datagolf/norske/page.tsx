/** DG-08 Norske proffer — Data Golf for coach. Bare coach og admin. */
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { DG08Norske } from "@/components/admin/precision/AGDataGolf";
import { hentNorskeResultater } from "@/lib/admin/datagolf/coach-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Norske proffer · Data Golf · AgencyOS" };

export default async function DataGolfNorskePage() {
  const user = await krevDataGolfBruker("/admin/datagolf/norske");
  const d = await hentNorskeResultater();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><DG08Norske spillere={d.spillere} kommende={d.kommende} /></AgencyOSSkall>;
}
