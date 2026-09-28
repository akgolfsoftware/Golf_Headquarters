import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WG-01 Morgentrening og uke. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/i-dag/uke */
export default async function WangIDagUkeSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WG-01" />;
}
