import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-18 Kalender og økt. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/trening/okter/[oktId] */
export default async function WangTreningOkterOktidSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-18" />;
}
