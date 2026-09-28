import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-17 Månedsplan. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening/maned */
export default async function WangTreningManedSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-17" />;
}
