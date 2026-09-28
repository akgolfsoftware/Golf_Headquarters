import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WG-03 Fysiske tester. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/tester */
export default async function WangTesterSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WG-03" />;
}
