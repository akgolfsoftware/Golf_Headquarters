import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangTreningsoversikt } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-42-treningsoversikt";

/** WANG-42 Treningsoversikt. Fasit: «WANG Golf Trening.dc.html» (6cfa623c). Rute: /team-wang/trening */
export default async function Side({ searchParams }: { searchParams: Promise<{ elev?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangTreningsoversikt gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
