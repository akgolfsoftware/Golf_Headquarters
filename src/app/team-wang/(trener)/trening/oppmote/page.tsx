import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-38 Oppmøte. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening/oppmote */
export default async function WangTreningOppmoteSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-38" />;
}
