import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-39 Rangering. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/tester/rangering */
export default async function WangTesterRangeringSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-39" />;
}
