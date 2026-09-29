import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangMorgenokter } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-04-morgenokter";

/** WANG-04 Morgenøkter. Fasit: «WANG Golf Batch 2.dc.html» #morgen (6cfa623c). Rute: /team-wang/trening/morgenokter */
export default async function Side({ searchParams }: { searchParams: Promise<{ okt?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangMorgenokter gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
