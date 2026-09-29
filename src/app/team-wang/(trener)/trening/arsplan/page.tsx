import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangArsplan } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-29-arsplan";

/** WANG-29 Årsplan og periode. Fasit: «WANG Golf Batch 10.dc.html» #trening (6cfa623c). Rute: /team-wang/trening/arsplan */
export default async function Side({ searchParams }: { searchParams: Promise<{ periode?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangArsplan gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
