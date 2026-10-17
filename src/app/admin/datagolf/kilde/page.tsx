/** DG-09 Kilde og dekning — Data Golf for coach. Bare coach og admin. */
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { DG09Kilde } from "@/components/admin/precision/AGDataGolf";
import { hentKilde } from "@/lib/admin/datagolf/coach-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kilde og dekning · Data Golf · AgencyOS" };

export default async function DataGolfKildePage() {
  const user = await krevDataGolfBruker("/admin/datagolf/kilde");
  return <AgencyOSSkall navn={user.name ?? "Coach"}><DG09Kilde rader={await hentKilde()} /></AgencyOSSkall>;
}
