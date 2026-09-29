import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangMorgenUke } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wg-01-uke";

/** WG-01 Morgentrening og uke. Fasit: «WANG Golf.dc.html» #uke (6cfa623c). Rute: /team-wang/i-dag/uke */
export default async function Side({ searchParams }: { searchParams: Promise<{ uke?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangMorgenUke gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
