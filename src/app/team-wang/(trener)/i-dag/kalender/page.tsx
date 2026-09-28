import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-30 Kalender og uke. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/i-dag/kalender */
export default async function WangIDagKalenderSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-30" />;
}
