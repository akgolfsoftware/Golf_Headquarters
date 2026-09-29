import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangManedsplan } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-17-manedsplan";

/** WANG-17 Månedsplan. Fasit: «WANG Golf Batch 6.dc.html» #maned (6cfa623c). Rute: /team-wang/trening/maned */
export default async function Side({ searchParams }: { searchParams: Promise<{ mnd?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangManedsplan gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
