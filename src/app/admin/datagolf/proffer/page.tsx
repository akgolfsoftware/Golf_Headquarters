/** DG-02 Proffkatalog — Data Golf for coach. Bare coach og admin. */
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { DG02Katalog } from "@/components/admin/precision/AGDataGolf";
import { hentKatalog } from "@/lib/admin/datagolf/coach-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proffer · Data Golf · AgencyOS" };

export default async function DataGolfKatalogPage({ searchParams }: { searchParams: Promise<{ sok?: string; tour?: string; norske?: string }> }) {
  const user = await krevDataGolfBruker("/admin/datagolf/proffer");
  const sp = await searchParams;
  const valg = { sok: sp.sok?.slice(0, 80), tour: sp.tour?.slice(0, 20) || undefined, norskForst: sp.norske === "1" };
  const { rader, turer } = await hentKatalog(valg);
  return <AgencyOSSkall navn={user.name ?? "Coach"}><DG02Katalog rader={rader} turer={turer} valg={valg} /></AgencyOSSkall>;
}
