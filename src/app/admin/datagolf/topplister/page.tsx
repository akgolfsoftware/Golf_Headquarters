/** DG-04 Topplister — Data Golf for coach. Bare coach og admin. */
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { DG04Topplister } from "@/components/admin/precision/AGDataGolf";
import { hentTopplister, TOPPLISTE_KATEGORIER, type TopplisteKategori } from "@/lib/admin/datagolf/coach-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Topplister · Data Golf · AgencyOS" };

export default async function DataGolfTopplisterPage({ searchParams }: { searchParams: Promise<{ kategori?: string; tour?: string; aar?: string }> }) {
  const user = await krevDataGolfBruker("/admin/datagolf/topplister");
  const sp = await searchParams;
  const kategori = (TOPPLISTE_KATEGORIER.find((k) => k.id === sp.kategori)?.id ?? "sgTotal") as TopplisteKategori;
  const tour = sp.tour && /^[a-z]{2,10}$/.test(sp.tour) ? sp.tour : "pga";
  const aarTall = Number(sp.aar);
  const aar = Number.isInteger(aarTall) && aarTall > 2000 ? aarTall : new Date().getUTCFullYear();
  const d = await hentTopplister(kategori, tour, aar, 20);
  return <AgencyOSSkall navn={user.name ?? "Coach"}>
    <DG04Topplister kategorier={TOPPLISTE_KATEGORIER} aktiv={kategori} tour={tour} aar={aar} aarValg={d.aarValg} turValg={d.turValg} rader={d.rader} oppdatert={d.oppdatert} />
  </AgencyOSSkall>;
}
