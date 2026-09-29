import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangPeriodeplan } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-16-periodeplan";

/** WANG-16 Periodeplan. Fasit: «WANG Golf Batch 6.dc.html» #periode (6cfa623c). Rute: /team-wang/trening/periode */
export default async function Side({ searchParams }: { searchParams: Promise<{ periode?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangPeriodeplan gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
