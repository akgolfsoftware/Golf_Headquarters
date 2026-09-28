import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-07 Elever. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elever */
export default async function WangEleverSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-07" />;
}
