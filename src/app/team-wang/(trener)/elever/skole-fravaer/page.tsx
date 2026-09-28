import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-05 Skole og fravær. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elever/skole-fravaer */
export default async function WangEleverSkoleFravaerSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-05" />;
}
