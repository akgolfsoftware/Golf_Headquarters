import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangOkter } from "@/app/team-wang/_components/wang-idag-trening/skjermer/wang-18-okter";

/** WANG-18 Kalender og økt (ukevisning). Fasit: «WANG Golf Batch 6.dc.html» #kalender (6cfa623c). Rute: /team-wang/trening/okter */
export default async function Side({ searchParams }: { searchParams: Promise<{ uke?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  return <WangOkter gruppe={gruppe} erDemo={erDemo} sok={await searchParams} />;
}
