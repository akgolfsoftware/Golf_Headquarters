import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-04 Morgenøkter. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening/morgenokter */
export default async function WangTreningMorgenokterSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-04" />;
}
