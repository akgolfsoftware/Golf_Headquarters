import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangKalender } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-30-kalender";

/** WANG-30 Kalender og uke. Fasit: «WANG Golf Batch 10.dc.html» #kalender (6cfa623c). Rute: /team-wang/i-dag/kalender */
export default async function Side({ searchParams }: { searchParams: Promise<{ visning?: string | string[]; uke?: string | string[]; mnd?: string | string[]; elev?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangKalender gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
