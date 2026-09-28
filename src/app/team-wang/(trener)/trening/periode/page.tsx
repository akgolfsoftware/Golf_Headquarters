import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-16 Periodeplan. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening/periode */
export default async function WangTreningPeriodeSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-16" />;
}
