import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-29 Årsplan og periode. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening/arsplan */
export default async function WangTreningArsplanSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-29" />;
}
