import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangIkkeBygget } from "@/components/wang/trener/wang-ikke-bygget";

/** WANG-44 Elevprofil. Midlertidig — skjermagenten bygger skjermen her. Rute: /team-wang/elev/[elevId] */
export default async function WangElevElevidSide() {
  await krevWangTrener();
  return <WangIkkeBygget skjermId="WANG-44" />;
}
