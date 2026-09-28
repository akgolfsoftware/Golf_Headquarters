import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-12 Ukessammendrag. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/i-dag/ukessammendrag */
export default async function WangIDagUkessammendragSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-12" />;
}
