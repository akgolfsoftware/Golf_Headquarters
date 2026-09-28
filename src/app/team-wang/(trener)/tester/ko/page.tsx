import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-37 Testkø. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/tester/ko */
export default async function WangTesterKoSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-37" />;
}
