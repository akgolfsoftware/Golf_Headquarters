import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-23 Resultater per elev. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/tester/resultater */
export default async function WangTesterResultaterSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-23" />;
}
