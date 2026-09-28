import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-22 Testprotokoller. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/tester/protokoller */
export default async function WangTesterProtokollerSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-22" />;
}
