import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangOppmote } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-38-oppmote";

/** WANG-38 Oppmøte. Fasit: «WANG Golf Batch 14.dc.html» #oppmote (6cfa623c). Rute: /team-wang/trening/oppmote */
export default async function Side({ searchParams }: { searchParams: Promise<{ visning?: string | string[]; uker?: string | string[]; okt?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangOppmote gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
