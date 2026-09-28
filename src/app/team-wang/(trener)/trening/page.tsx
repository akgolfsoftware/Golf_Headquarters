import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-42 Treningsoversikt. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening */
export default async function WangTreningSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-42" />;
}
