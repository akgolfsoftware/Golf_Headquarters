import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-43 Elever som trenger deg. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/i-dag */
export default async function WangIDagSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-43" />;
}
