import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangUkessammendrag } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-12-ukessammendrag";

/** WANG-12 Ukessammendrag. Fasit: «WANG Golf Batch 4.dc.html» #uke (6cfa623c). Rute: /team-wang/i-dag/ukessammendrag */
export default async function Side({ searchParams }: { searchParams: Promise<{ uke?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangUkessammendrag gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
